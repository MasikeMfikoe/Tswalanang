import { chromium } from "playwright"
import type { TrackingResult, TrackingData, TrackingEvent } from "@/types/tracking"

interface ScrapedEvent {
  status: string
  location: string
  timestamp: string
  description?: string
  vessel?: string
  flightNumber?: string
  pieces?: number
  volume?: string
  weight?: string
}

interface ScrapedTimelineEntry {
  location: string
  terminal?: string
  events: ScrapedEvent[]
}

interface ScrapedTrackingData {
  shipmentNumber: string
  status: string
  containerNumber?: string
  containerType?: string
  weight?: string
  origin: string
  destination: string
  pol?: string
  pod?: string
  estimatedArrival?: string
  lastLocation?: string
  timeline: ScrapedTimelineEntry[]
  documents?: Array<{
    name: string
    type: string
    url: string
    date: string
  }>
  details?: {
    packages?: string
    specialInstructions?: string
    dimensions?: string
    shipmentType?: string
    pieces?: number
    volume?: string
  }
}

export class WebScrapingService {
  private browser: any // Use 'any' for Playwright's Browser type to avoid direct dependency issues
  private browserInitialized = false

  constructor() {
    // No-op in constructor, browser is launched on demand
  }

  private async initBrowser() {
    if (!this.browserInitialized) {
      console.log("[WebScrapingService] Initializing Playwright browser...")
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process", // For Docker/serverless environments
          "--disable-gpu",
        ],
      })
      this.browserInitialized = true
      console.log("[WebScrapingService] Playwright browser initialized.")
    }
  }

  public async closeBrowser() {
    if (this.browserInitialized && this.browser) {
      console.log("[WebScrapingService] Closing Playwright browser...")
      await this.browser.close()
      this.browserInitialized = false
      this.browser = null
      console.log("[WebScrapingService] Playwright browser closed.")
    }
  }

  async scrapeContainer(trackingNumber: string, carrierHint?: string): Promise<TrackingResult> {
    await this.initBrowser()
    let result: TrackingResult = {
      success: false,
      error: "No scraping method found for this carrier or type.",
      source: "WebScraping",
    }

    // Attempt to detect carrier based on hint or prefix
    let carrierToScrape = carrierHint?.toLowerCase()
    if (!carrierToScrape && trackingNumber.length >= 4) {
      const prefix = trackingNumber.substring(0, 4).toUpperCase()
      if (prefix.startsWith("MAEU") || prefix.startsWith("MRKU") || prefix.startsWith("MSKU")) {
        carrierToScrape = "maersk"
      } else if (prefix.startsWith("MSCU") || prefix.startsWith("MEDU")) {
        carrierToScrape = "msc"
      } else if (prefix.startsWith("CMAU") || prefix.startsWith("CXDU")) {
        carrierToScrape = "cma cgm"
      } else if (prefix.startsWith("HLXU") || prefix.startsWith("HLCU")) {
        carrierToScrape = "hapag-lloyd"
      } else if (prefix.startsWith("COSU") || prefix.startsWith("CBHU")) {
        carrierToScrape = "cosco"
      } else if (prefix.startsWith("EVRU") || prefix.startsWith("EGHU")) {
        carrierToScrape = "evergreen"
      }
      // Add more carrier prefix detections as needed
    }

    console.log(`[WebScrapingService] Attempting to scrape for carrier: ${carrierToScrape || "unknown"}`)

    try {
      switch (carrierToScrape) {
        case "maersk":
          result = await this.scrapeMaersk(trackingNumber)
          break
        case "msc":
          result = await this.scrapeMSC(trackingNumber)
          break
        case "cma cgm":
          result = await this.scrapeCMACGM(trackingNumber)
          break
        case "hapag-lloyd":
          result = await this.scrapeHapagLloyd(trackingNumber)
          break
        case "cosco":
          result = await this.scrapeCOSCO(trackingNumber)
          break
        case "evergreen":
          result = await this.scrapeEvergreen(trackingNumber)
          break
        // Add cases for other carriers
        default:
          result = {
            success: false,
            error: `Web scraping not supported or carrier not identified for '${trackingNumber}'.`,
            source: "WebScraping",
          }
      }
    } catch (e: any) {
      console.error(`[WebScrapingService] Error during scraping for ${trackingNumber}:`, e)
      result = {
        success: false,
        error: `Web scraping failed: ${e.message || "Unknown error"}`,
        source: "WebScraping",
      }
    } finally {
      // Consider keeping browser open for multiple requests or closing based on strategy
      // await this.closeBrowser(); // Close browser after each scrape if not reusing
    }

    return result
  }

  private async scrapeMaersk(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(`https://www.maersk.com/tracking/${trackingNumber}`, { waitUntil: "networkidle" })
      await page.waitForSelector('[data-testid="container-number"]', { timeout: 15000 }) // Wait for a key element

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"
        const extractAttribute = (selector: string, attr: string) =>
          document.querySelector(selector)?.getAttribute(attr)?.trim() || "N/A"

        const shipmentNumber = extractText('[data-testid="container-number"]')
        const status = extractText(".shipment-status")
        const origin = extractText('[data-testid="origin-port"]')
        const destination = extractText('[data-testid="destination-port"]')
        const estimatedArrival = extractText('[data-testid="eta-date"]')
        const lastLocation = extractText('[data-testid="current-location"]')

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".event-item").forEach((eventElement) => {
          const location = eventElement.querySelector(".event-location")?.textContent?.trim() || "Unknown Location"
          const status = eventElement.querySelector(".event-status")?.textContent?.trim() || "Unknown Status"
          const date = eventElement.querySelector(".event-date")?.textContent?.trim() || ""
          const time = eventElement.querySelector(".event-time")?.textContent?.trim() || ""
          const description = eventElement.querySelector(".event-description")?.textContent?.trim() || ""

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          let eventType: TrackingEvent["type"] = "event"
          if (status.includes("Departed")) eventType = "vessel-departure"
          if (status.includes("Arrived")) eventType = "vessel-arrival"
          if (status.includes("Gate-in") || status.includes("Gate-out")) eventType = "gate"
          if (status.includes("Loaded")) eventType = "load"
          if (status.includes("Received")) eventType = "cargo-received"
          if (status.includes("Customs")) eventType = "customs-cleared"

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: eventType,
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: eventType,
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber, // Maersk often uses container number as shipment number
          containerType: "N/A", // Not easily scraped
          weight: "N/A", // Not easily scraped
          pol: "N/A", // Not easily scraped
          pod: "N/A", // Not easily scraped
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "Maersk (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] Maersk scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape Maersk: ${error.message || "Element not found or page structure changed."}`,
        source: "Maersk (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  private async scrapeMSC(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(
        `https://www.msc.com/track-a-shipment?agencyPath=msc&searchType=container&searchNumber=${trackingNumber}`,
        { waitUntil: "networkidle" },
      )
      await page.waitForSelector(".msc-tracking-details", { timeout: 15000 })

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"

        const shipmentNumber = extractText(".msc-tracking-number")
        const status = extractText(".msc-status-text")
        const origin = extractText(".msc-origin-port")
        const destination = extractText(".msc-destination-port")
        const estimatedArrival = extractText(".msc-eta-date")
        const lastLocation = extractText(".msc-last-location")

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".msc-event-item").forEach((eventElement) => {
          const location = extractText(".event-location", eventElement)
          const status = extractText(".event-status", eventElement)
          const date = extractText(".event-date", eventElement)
          const time = extractText(".event-time", eventElement)
          const description = extractText(".event-description", eventElement)

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          let eventType: TrackingEvent["type"] = "event"
          if (status.includes("Departure")) eventType = "vessel-departure"
          if (status.includes("Arrival")) eventType = "vessel-arrival"

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: eventType,
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: eventType,
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber,
          containerType: "N/A",
          weight: "N/A",
          pol: "N/A",
          pod: "N/A",
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "MSC (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] MSC scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape MSC: ${error.message || "Element not found or page structure changed."}`,
        source: "MSC (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  private async scrapeCMACGM(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(`https://www.cma-cgm.com/ebusiness/tracking/search?number=${trackingNumber}`, {
        waitUntil: "networkidle",
      })
      await page.waitForSelector(".tracking-results-container", { timeout: 15000 })

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"

        const shipmentNumber = extractText(".tracking-number-display")
        const status = extractText(".shipment-status-value")
        const origin = extractText(".origin-port-name")
        const destination = extractText(".destination-port-name")
        const estimatedArrival = extractText(".eta-date-value")
        const lastLocation = extractText(".last-event-location")

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".event-timeline-item").forEach((eventElement) => {
          const location = extractText(".event-location", eventElement)
          const status = extractText(".event-status", eventElement)
          const date = extractText(".event-date", eventElement)
          const time = extractText(".event-time", eventElement)
          const description = extractText(".event-description", eventElement)

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: "event",
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: "event",
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber,
          containerType: "N/A",
          weight: "N/A",
          pol: "N/A",
          pod: "N/A",
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "CMA CGM (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] CMA CGM scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape CMA CGM: ${error.message || "Element not found or page structure changed."}`,
        source: "CMA CGM (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  private async scrapeHapagLloyd(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(
        `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${trackingNumber}`,
        { waitUntil: "networkidle" },
      )
      await page.waitForSelector(".hl-tracking-results", { timeout: 15000 })

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"

        const shipmentNumber = extractText(".hl-tracking-number")
        const status = extractText(".hl-status-text")
        const origin = extractText(".hl-origin-port")
        const destination = extractText(".hl-destination-port")
        const estimatedArrival = extractText(".hl-eta-date")
        const lastLocation = extractText(".hl-last-location")

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".hl-event-row").forEach((eventElement) => {
          const location = extractText(".event-location", eventElement)
          const status = extractText(".event-status", eventElement)
          const date = extractText(".event-date", eventElement)
          const time = extractText(".event-time", eventElement)
          const description = extractText(".event-description", eventElement)

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: "event",
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: "event",
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber,
          containerType: "N/A",
          weight: "N/A",
          pol: "N/A",
          pod: "N/A",
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "Hapag-Lloyd (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] Hapag-Lloyd scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape Hapag-Lloyd: ${error.message || "Element not found or page structure changed."}`,
        source: "Hapag-Lloyd (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  private async scrapeCOSCO(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(
        `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${trackingNumber}`,
        { waitUntil: "networkidle" },
      )
      await page.waitForSelector(".cosco-tracking-info", { timeout: 15000 })

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"

        const shipmentNumber = extractText(".cosco-shipment-number")
        const status = extractText(".cosco-status")
        const origin = extractText(".cosco-origin")
        const destination = extractText(".cosco-destination")
        const estimatedArrival = extractText(".cosco-eta")
        const lastLocation = extractText(".cosco-last-location")

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".cosco-event-item").forEach((eventElement) => {
          const location = extractText(".event-location", eventElement)
          const status = extractText(".event-status", eventElement)
          const date = extractText(".event-date", eventElement)
          const time = extractText(".event-time", eventElement)
          const description = extractText(".event-description", eventElement)

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: "event",
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: "event",
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber,
          containerType: "N/A",
          weight: "N/A",
          pol: "N/A",
          pod: "N/A",
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "COSCO (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] COSCO scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape COSCO: ${error.message || "Element not found or page structure changed."}`,
        source: "COSCO (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  private async scrapeEvergreen(trackingNumber: string): Promise<TrackingResult> {
    const page = await this.browser.newPage()
    try {
      await page.goto(
        `https://www.evergreen-line.com/emodal/stpb/stpb_show.do?lang=en&f_cmd=track&f_container_no=${trackingNumber}`,
        { waitUntil: "networkidle" },
      )
      await page.waitForSelector(".evergreen-tracking-table", { timeout: 15000 })

      const data = await page.evaluate(() => {
        const extractText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "N/A"

        const shipmentNumber = extractText(".evergreen-shipment-number")
        const status = extractText(".evergreen-status")
        const origin = extractText(".evergreen-origin")
        const destination = extractText(".evergreen-destination")
        const estimatedArrival = extractText(".evergreen-eta")
        const lastLocation = extractText(".evergreen-last-location")

        const timeline: ScrapedTimelineEntry[] = []
        document.querySelectorAll(".evergreen-event-row").forEach((eventElement) => {
          const location = extractText(".event-location", eventElement)
          const status = extractText(".event-status", eventElement)
          const date = extractText(".event-date", eventElement)
          const time = extractText(".event-time", eventElement)
          const description = extractText(".event-description", eventElement)

          const timestamp = date && time ? new Date(`${date} ${time}`).toISOString() : new Date().toISOString()

          const existingLocation = timeline.find((t) => t.location === location)
          if (existingLocation) {
            existingLocation.events.push({
              type: "event",
              status,
              location,
              timestamp,
              date,
              time,
              description,
            })
          } else {
            timeline.push({
              location,
              events: [
                {
                  type: "event",
                  status,
                  location,
                  timestamp,
                  date,
                  time,
                  description,
                },
              ],
            })
          }
        })

        return {
          shipmentNumber,
          status,
          origin,
          destination,
          estimatedArrival,
          lastLocation,
          timeline,
          containerNumber: shipmentNumber,
          containerType: "N/A",
          weight: "N/A",
          pol: "N/A",
          pod: "N/A",
          documents: [],
          details: {
            packages: "N/A",
            specialInstructions: "N/A",
            dimensions: "N/A",
            shipmentType: "ocean",
          },
        } as ScrapedTrackingData
      })

      return {
        success: true,
        data: this.transformScrapedData(data),
        source: "Evergreen (Scraped)",
        isLiveData: true,
        scrapedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[WebScrapingService] Evergreen scraping failed for ${trackingNumber}:`, error)
      return {
        success: false,
        error: `Failed to scrape Evergreen: ${error.message || "Element not found or page structure changed."}`,
        source: "Evergreen (Scraped)",
      }
    } finally {
      await page.close()
    }
  }

  // Helper to transform scraped data into the common TrackingData format
  private transformScrapedData(scrapedData: ScrapedTrackingData): TrackingData {
    return {
      shipmentNumber: scrapedData.shipmentNumber,
      status: scrapedData.status,
      containerNumber: scrapedData.containerNumber,
      containerType: scrapedData.containerType,
      weight: scrapedData.weight,
      origin: scrapedData.origin,
      destination: scrapedData.destination,
      pol: scrapedData.pol,
      pod: scrapedData.pod,
      estimatedArrival: scrapedData.estimatedArrival,
      lastLocation: scrapedData.lastLocation,
      timeline: scrapedData.timeline.map((entry) => ({
        location: entry.location,
        terminal: entry.terminal,
        events: entry.events.map((event) => ({
          type: event.type || "event",
          status: event.status,
          location: event.location,
          timestamp: event.timestamp,
          date: new Date(event.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          time: new Date(event.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          description: event.description,
          vessel: event.vessel,
          flightNumber: event.flightNumber,
          pieces: event.pieces,
          volume: event.volume,
          weight: event.weight,
        })),
      })),
      documents: scrapedData.documents,
      details: scrapedData.details,
      raw: scrapedData, // Keep raw scraped data for debugging
    }
  }
}
