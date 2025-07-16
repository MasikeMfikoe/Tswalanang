import { NextResponse } from "next/server"

export async function GET() {
  const searatesApiKey = process.env.SEARATES_API_KEY

  if (searatesApiKey) {
    return NextResponse.json({
      message: "SEARATES_API_KEY is set!",
      valueLength: searatesApiKey.length,
      // For security, do NOT expose the actual key value in a real application.
      // We're only showing length here as a confirmation.
    })
  } else {
    return NextResponse.json(
      {
        message: "SEARATES_API_KEY is NOT set.",
      },
      { status: 404 },
    )
  }
}
