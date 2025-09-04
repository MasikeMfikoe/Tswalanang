import { type NextRequest, NextResponse } from "next/server"
import { webScrapingService } from "@/lib/services/web-scraping-service"

type ScrapeResult = {
  success: boolean
  data?: unknown
  error?: string
  source?: string
  [key: string]: unknown
}

async function runScrape(containerNumber: string, carrier?: string | null): Promise<ScrapeResult> {
  const svc: any = webScrapingService

  try {
    if (carrier && typeof svc.scrapeByCarrier === "function") {
      // Preferred: service implements scrapeByCarrier(container, carrier)
      return await svc.scrapeByCarrier(containerNumber, carrier)
    }

    if (typeof svc.scrapeContainer === "function") {
      // Common: service implements scrapeContainer(container[, carrier])
      return await svc.scrapeContainer(containerNumber, carrier)
    }

    if (typeof svc.scrape === "function") {
      // Fallback: generic scrape API
      return await svc.scrape({ containerNumber, carrier })
    }

    return { success: false, error: "Scraping function not implemented on webScrapingService" }
  } finally {
    if (typeof svc.closeBrowser === "function") {
      try {
        await svc.closeBrowser()
      } catch (e) {
        console.error("Error closing browser:", e)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any))
    const containerNumber: string | undefined = body?.containerNumber
    const carrier: string | undefined = body?.carrier

    if (!containerNumber) {
      return NextResponse.json({ success: false, error: "Container number is required" }, { status: 400 })
    }

    const result = await runScrape(containerNumber, carrier)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Web scraping failed", source: result.source },
        { status: 502 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      source: result.source,
      isLiveData: true,
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Scraping API (POST) error:", error)
    return NextResponse.json(
      { success: false, error: "Web scraping service temporarily unavailable", details: String(error) },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const containerNumber = searchParams.get("container")
    const carrier = searchParams.get("carrier")

    if (!containerNumber) {
      return NextResponse.json({ success: false, error: "Container number is required" }, { status: 400 })
    }

    const result = await runScrape(containerNumber, carrier)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Web scraping failed", source: result.source },
        { status: 502 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Scraping API (GET) error:", error)
    return NextResponse.json(
      { success: false, error: "Web scraping service temporarily unavailable", details: String(error) },
      { status: 500 },
    )
  }
}
