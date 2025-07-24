// This file was left out for brevity. Assume it is correct and does not need any modifications.
// Placeholder content for app/api/webhooks/test/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const payload = await request.json()
  console.log("Received test webhook:", payload)
  return NextResponse.json({ received: true })
}
