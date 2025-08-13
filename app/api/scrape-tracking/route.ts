import { type NextRequest, NextResponse } from "next/server"
import { webScrapingService } from "@/lib/services/web-scraping-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { containerNumber, carrier } = body

    if (!containerNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Container number is required",
        },
        { status: 400 },
      )
    }

    console.log(`Starting web scraping for container: ${containerNumber}`)

    let result
    if (carrier) {
      result = await webScrapingService.scrapeContainer(containerNumber, carrier)
    } else {
      result = await webScrapingService.scrapeContainer(containerNumber)
    }

    // Always close browser after scraping
    await webScrapingService.closeBrowser()

    if (result.success) {
      console.log(`✅ Web scraping successful for ${containerNumber}`)
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      })
    } else {
      console.log(`❌ Web scraping failed for ${containerNumber}: ${result.error}`)
      return NextResponse.json({
        success: false,
        error: result.error,
        source: result.source,
      })
    }
  } catch (error) {
    console.error("Scraping API error:", error)

    // Ensure browser is closed on error
    try {
      await webScrapingService.closeBrowser()
    } catch (closeError) {
      console.error("Error closing browser:", closeError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Web scraping service temporarily unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const containerNumber = searchParams.get("container")
  const carrier = searchParams.get("carrier")

  if (!containerNumber) {
    return NextResponse.json(
      {
        success: false,
        error: "Container number is required",
      },
      { status: 400 },
    )
  }

  try {
    let result
    if (carrier) {
      result = await webScrapingService.scrapeContainer(containerNumber, carrier)
    } else {
      result = await webScrapingService.scrapeContainer(containerNumber)
    }

    await webScrapingService.closeBrowser()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Scraping API error:", error)

    try {
      await webScrapingService.closeBrowser()
    } catch (closeError) {
      console.error("Error closing browser:", closeError)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Web scraping service temporarily unavailable",
      },
      { status: 500 },
    )
  }
}
