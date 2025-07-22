import { NextResponse } from "next/server"
import { GocometService } from "@/lib/services/gocomet-service"

export async function POST(request: Request) {
  const gocometEmail = process.env.GOCOMET_EMAIL
  const gocometPassword = process.env.GOCOMET_PASSWORD

  if (!gocometEmail || !gocometPassword) {
    return NextResponse.json(
      { success: false, error: "GoComet credentials (email/password) are not configured in environment variables." },
      { status: 500 },
    )
  }

  try {
    const gocometService = new GocometService()
    const token = await gocometService.authenticate(gocometEmail, gocometPassword)

    if (token) {
      return NextResponse.json({ success: true, token: token })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to obtain GoComet authentication token." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error in /api/gocomet-auth route:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during GoComet authentication." },
      { status: 500 },
    )
  }
}
