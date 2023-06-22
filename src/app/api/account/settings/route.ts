import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import {prisma} from "@/app";

export const dynamic = 'force-dynamic'


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('accountId') ?? "0")
  const settings = await prisma.mondayAccountSettings.findUnique({
    where: {
      account_id: id,
    }
  })
  return NextResponse.json(settings ?? {})
}


export async function POST(req: Request) {
  const reqJson = await req.json();
  console.log(reqJson)

  const settings = await prisma.mondayAccountSettings.upsert({
    where: {
      account_id: reqJson.account_id,
    },
    update: {
      crm_workspace_id: reqJson.crm_workspace_id,
      pm_workspace_id: reqJson.pm_workspace_id
    },
    create: {
      account_id: reqJson.account_id,
      crm_workspace_id: reqJson.crm_workspace_id,
      pm_workspace_id: reqJson.pm_workspace_id,
    },
  })

  return NextResponse.json(settings ?? {})  
}