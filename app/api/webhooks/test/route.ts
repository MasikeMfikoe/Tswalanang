import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Webhook test endpoint is working",
    timestamp: new Date().toISOString(),
    status: "active",
  })
}

export async function POST() {
  return NextResponse.json({
    message: "Webhook POST endpoint is working",
    timestamp: new Date().toISOString(),
    status: "active",
  })
}
