import { NextRequest, NextResponse } from "next/server"
const fs = require('fs');
export const dynamic = 'force-dynamic'
import Replicate from "replicate";
import {Storage} from "@google-cloud/storage";
import { v4 as uuidv4 } from 'uuid';
import mondaySdk from 'monday-sdk-js';
import {prisma} from "@/app";


const monday = mondaySdk();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY ?? "",
});

const storage = new Storage({
    keyFilename: "keys/account-story.json",
});

const bucket = storage.bucket(process.env.GCS_BUCKET as string);

function getPublicUrl(filename: string) {
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`;
}

export async function POST(req: Request, res: NextResponse) {
    // Get formData from request
    const formData = await req.formData();

    // Get file from formData
    const file = formData.get('file') as File;
    const fileId = uuidv4()
    // const writableStream = fs.createWriteStream("/tmp/file.mp3");
    // await file.stream().pipeTo(writableStream)

    let extension = ""
    if (file.type == "audio/mpeg") {
        extension = ".mp3"
    }

    const fileName = fileId + extension

    const arrayBuffer = await file.arrayBuffer()
    const view = new Uint8Array(arrayBuffer)

    const filePath = `/tmp/${fileName}`

    fs.writeFileSync(filePath, view)

    const options = {
        destination: fileName,
    };

    await bucket.upload(filePath, options);
    console.log(`${filePath} uploaded to ${process.env.GCS_BUCKET}`);

    const obj = bucket.file(fileName)
    await obj.makePublic()

    await prisma.transcription.create({
        data: {
            file_id: fileId,
            account_id: 0,
            status: "uploaded",
            gcs_url: getPublicUrl(fileName),
            response: ""
        },
    })

    console.log("transcription record created")

    const output = await replicate.run(
        "meronym/speaker-transcription:9950ee297f0fdad8736adf74ada54f63cc5b5bdfd5b2187366910ed5baf1a7a1",
        {
            input: {
                audio: getPublicUrl(fileName)
            }
        }
    );

    await prisma.transcription.update({
        where: {
            file_id: fileId,
        },
        data: {
            status: "transcribed",
            response: output
        },
    })

    return NextResponse.json({ status: "transcribed", url: output })
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};