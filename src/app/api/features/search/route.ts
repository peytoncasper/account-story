import { NextRequest, NextResponse } from "next/server"
import {PineconeClient} from "@pinecone-database/pinecone";
import {Configuration, OpenAIApi} from "openai";
export const dynamic = 'force-dynamic'

const pinecone = new PineconeClient();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


async function searchVector(vector: any) {
    const index = pinecone.Index("cohesive-ai");
    const queryRequest = {
        vector: vector,
        topK: 3,
        includeValues: true,
        includeMetadata: true,
    };
    return index.query({queryRequest})
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

export async function POST(req: Request, res: NextResponse) {
    const reqJson = await req.json();

    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT as string,
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const vector = await getEmbedding(reqJson.query)
    const results = await searchVector(vector)

    console.log(results)

    return NextResponse.json(results)
}
