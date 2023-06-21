import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import formidable, {errors as formidableErrors} from 'formidable';
import { NextApiRequest } from "next";
import { Writable } from "stream";

export const dynamic = 'force-dynamic'
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY ?? "",
});





export async function POST(req: Request, res: NextResponse) {
  // Get formData from request
  const formData = await req.formData();

  // Get file from formData
  const file = formData.get('file') as File;

  const output = await replicate.run(
    "meronym/speaker-transcription:9950ee297f0fdad8736adf74ada54f63cc5b5bdfd5b2187366910ed5baf1a7a1",
    {
      input: {
        audio: "https://storage.googleapis.com/account-story-recordings/testRecording1.mp3",
      }
    }
  );

  console.log(output)

  return NextResponse.json({ file })  
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};