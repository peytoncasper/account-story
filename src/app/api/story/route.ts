import {NextResponse} from "next/server";
import {Configuration, OpenAIApi} from "openai";
import axios from "axios";
import * as fs from "fs";
import * as http from "http";
import Jimp from "jimp";
import * as https from "https";
import {spawn} from "child_process";

export const dynamic = 'force-dynamic'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const apiKey = Buffer.from(process.env.SCENARIO_API_KEY + ":" +process.env.SCENARIO_API_SECRET).toString('base64')

async function getCompletionsFromOpenAi(prompt:string, n: number) {
    try {

        const completionsFromApi = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
        });
        return completionsFromApi.data.choices;
    } catch (err) {
        // @ts-ignore
        console.error('error from OpenAI:', err.response.data.error);
    }
}

async function pollInferenceStatus(storyId: string, modelId: string, inferenceId: string) {

    const inferenceResults = await fetch(`https://api.cloud.scenario.gg/v1/models/${modelId}/inferences/${inferenceId}`, {
        headers: {
            "Authorization": "Basic " + apiKey,
            "Accept": "application/json"
        }
    }).then(response => {return response.json()})


    if (inferenceResults.inference.status == "succeeded") {
        return inferenceResults.inference.images[0]
    } else if (inferenceResults.inference.status == "in-progress") {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await pollInferenceStatus(storyId, modelId, inferenceId);
    }
}

async function generateStoryImage(storyId: string, prompt: string) {
    const MODEL_ID="FjCFxwb6SCmPz7GRuAZLvA"

    const inferenceResponse = await fetch(`https://api.cloud.scenario.gg/v1/models/${MODEL_ID}/inferences`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "parameters": {
                "type": "txt2img", "prompt": prompt,
                "numSamples": 1
            }
        }),
    })
    .then(response => {
        return response.json()
    });

    let status = "in-progress"

    while (status != "succeeded") {
        const inferenceResults = await fetch(`https://api.cloud.scenario.gg/v1/models/${MODEL_ID}/inferences/${inferenceResponse.inference.id}`, {
            headers: {
                "Authorization": "Basic " + apiKey,
                "Accept": "application/json"
            }
        }).then(response => {return response.json()})

        if (inferenceResults.inference.status == "succeeded") {
            return inferenceResults.inference.images[0]
        } else if (inferenceResults.inference.status == "in-progress") {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

export async function POST(req: Request, res: NextResponse) {
    const reqJson = await req.json();

    const transcripts = JSON.stringify(reqJson.transcripts)
    const customerName = reqJson.customer

    const prompt = `
    \`\`\`${transcripts}\`\`\`
    The JSON array provided above contains transcripts of calls with a customer.  I want you to write a multi page childrens story based on the contents of the call.
    Provide this story as a JSON array where each element represents the text on that page.
    I also want a prompt that will be used to generate an image that fits the emotion in that scene. Make the prompt themed around the customer.

    

    Make the prompt use keywords separated by commas.
    
    Return the story in a JSON object matches the following format.
    
    {
        "story": [
            {
                "page_text": "",
                "prompt": ""
            }
        ]
    }
    `

    const storyId  = customerName.toLowerCase().replaceAll(" ", "-")
    let book: any = {}

    if (!fs.existsSync(`/tmp/${storyId}`)){
        fs.mkdirSync(`/tmp/${storyId}`);
    }

    if (!fs.existsSync(`/tmp/${storyId}/story.json`)) {
        console.log("Getting Story")
        let retries = 0
        let lastCompletion = ""

        for (retries; retries < 5; retries++) {
            try {
                if (retries > 0) {
                    const completions = await getCompletionsFromOpenAi(`Extract the JSON from the string: \`\`\`${lastCompletion}\`\`\``, 1);
                    if (completions && completions.length == 1) {
                        // @ts-ignore
                        book = JSON.parse(completions[0].message.content)
                    }
                } else {
                    const completions = await getCompletionsFromOpenAi(prompt, 1);
                    if (completions && completions.length == 1) {
                        // @ts-ignore
                        book = JSON.parse(completions[0].message.content)
                        // @ts-ignore
                        lastCompletion = completions[0].message.content
                    }
                }

            } catch {

            }
        }
        let json = JSON.stringify(book);
        fs.writeFileSync(`/tmp/${storyId}/story.json`, json);
    } else {
        book = JSON.parse(fs.readFileSync(`/tmp/${storyId}/story.json`).toString())
    }

    let images:any = []

    console.log(book)

    let imagesGenerated = true
    for(let i = 0; i < book.story.length; i++)
    {
        if(!fs.existsSync(`/tmp/${storyId}/${i}.png`)) {
            imagesGenerated = false
        }
    }

    if(!imagesGenerated) {
        console.log("Generating Images")
        book.story.forEach((page: any) => {
            images.push(generateStoryImage(storyId, page.prompt))
        })

        const imageUrls = await Promise.all(images)

        console.log("Images Generated")

        console.log("Downloading Images")

        imageUrls.forEach((image: any, i) => {
            Jimp.read(image.url)
            .then(image => {
                function makeIteratorThatFillsWithColor(color: any) {
                    return function (x, y, offset: any) {
                        this.bitmap.data.writeUInt32BE(color, offset, true);
                    }
                };

// fill
                image.scan(5, 5, 350, 150, makeIteratorThatFillsWithColor(0x00000040));


                Jimp.loadFont("font/SMASH.fnt").then((font) => {
                    image.print(font, 10, 10, book.story[i].page_text, 350, 200);
                    image.write(`/tmp/${storyId}/${i}.png`);
                    console.log("Added text overlay")
                })

            })
                // .catch(err => {
                //     // Handle an exception.
                // });
        })




        //
        //     const file = fs.createWriteStream(`/tmp/${storyId}/${i}.png`);
        //     const request = https.get(image.url, function(response) {
        //         response.pipe(file);
        //         // after download completed close filestream
        //         file.on("finish", async () => {
        //             file.close();
        //             console.log("Download Completed");
        //
        //
        //         });
        //     });
        // })
    }
    await fetch(`http://127.0.0.1:5000?storyId=${storyId}`)


    return NextResponse.json({"status": "success"})
}