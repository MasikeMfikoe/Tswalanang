import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const container = searchParams.get("container")

    if (!container) {
      return NextResponse.json({ error: "Container number is required" }, { status: 400 })
    }

    const apiKey = process.env.SEARATES_API_KEY
    if (!apiKey) {
      console.error("[v0] ❌ SEARATES_API_KEY environment variable not set")
      return NextResponse.json({ error: "SeaRates API key not configured" }, { status: 500 })
    }

    // Construct the SeaRates widget URL with the API key on server-side
    const widgetUrl = `https://www.searates.com/container-tracking/widget/?number=${encodeURIComponent(container)}&width=100%&height=500px&api_key=${apiKey}`

    console.log(`[v0] 🚢 Generated SeaRates widget URL for container: ${container}`)

    return NextResponse.json({
      success: true,
      widgetUrl,
      container,
    })
  } catch (error) {
    console.error("[v0] ❌ Error in searates-widget API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
