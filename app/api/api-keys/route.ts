import { NextResponse } from "next/server"

export async function POST() {
  // Simplified version
  const apiKey = "sample-api-key-" + Math.random().toString(36).substring(2, 15)

  return NextResponse.json({ apiKey })
}
