import { NextRequest, NextResponse } from "next/server"
import {Configuration, OpenAIApi} from "openai";
export const dynamic = 'force-dynamic'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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
export async function POST(req: Request, res: NextResponse) {
    const reqJson = await req.json();

    const transcript = JSON.stringify(reqJson.transcription.segments)
    const accounts = reqJson.accounts.join("\n")
    const prompt = `
    \`\`\`${transcript}\`\`\`
    Based on this transcript, provide this information in this JSON format.
    
    \`\`\`
    ${accounts}
    \`\`\`

    

    What was the purpose of this call in four words, use it as a title?
    Use the list of accounts above to determine which customer account.  Auto correct the customer account name that most closely matches an account in the list above. Which customer account is being discussed in this call?
    Are there any feature requests mentioned in this call?
    How much ACV is this opportunity worth if a user costs $50 each?
    
    Do not include any additional text other than the JSON object.
    
    If you can't find information in the transcript, leave it empty and return the JSON object with default values.
    
    \`\`\`{
    "title": "",
    "customer_account": "",
    "feature_requests": [{"feature": "", "purpose": ""}].
    "acv": 0.0
    }
    \`\`\`
    `

    let retries = 0
    let metadata = ""
    let lastCompletion = ""

    for (retries; retries < 5; retries++) {
        try {
            if (retries > 0) {
                const completions = await getCompletionsFromOpenAi(`Extract the JSON from the string: \`\`\`${metadata}\`\`\``, 1);
                if (completions && completions.length == 1) {
                    // @ts-ignore
                    metadata= completions[0].message.content
                    return NextResponse.json(JSON.parse(metadata), {
                        status: 200
                    })
                }
            } else {
                const completions = await getCompletionsFromOpenAi(prompt, 1);
                if (completions && completions.length == 1) {
                    // @ts-ignore
                    metadata= completions[0].message.content
                    return NextResponse.json(JSON.parse(metadata), {
                        status: 200
                    })
                }
            }

        } catch {

        }
    }


    return NextResponse.json({}, {
        status: 200
    })
}

