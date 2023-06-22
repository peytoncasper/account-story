import { NextRequest, NextResponse } from "next/server"
import {PineconeClient} from "@pinecone-database/pinecone";
import {Configuration, OpenAIApi} from "openai";
export const dynamic = 'force-dynamic'

const pinecone = new PineconeClient();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


async function insertVector(id: string, vector: any) {
    const index = pinecone.Index("cohesive-ai");

    const resp = index.upsert({
        upsertRequest: {
            vectors: [
                {
                    id: id,
                    values: vector,
                    metadata: {
                        type: "transcript",
                    },
                },

            ],
        },
    })

    return resp
}

async function getEmbedding(query: any) {
    const res = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: [query],
    }).catch(function (error) {
        console.log(error.toJSON());
    });
    return res?.data.data[0].embedding
}

async function searchVector(vector: any) {
    const index = pinecone.Index("cohesive-ai");
    const queryRequest = {
        vector: vector,
        topK: 5,
        includeValues: true,
        includeMetadata: true,
    };
    return index.query({queryRequest})
}


export async function POST(req: Request, res: NextResponse) {
    const reqJson = await req.json();

    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT as string,
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const vector = await getEmbedding(reqJson.transcript)

    await insertVector(reqJson.id, vector)

    return NextResponse.json({"status": "success"})
}

export async function GET(req: Request, res: NextResponse) {
    const { searchParams } = new URL(req.url)
    const query = parseInt(searchParams.get('q') ?? "")

    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT as string,
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const vector = await getEmbedding("Find transcripts that talk about this feature request: " + query)
    const results = await searchVector(vector)

    return NextResponse.json(results)
}
