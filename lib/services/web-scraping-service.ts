import { chromium, type Browser } from "playwright"

export interface ScrapedTrackingData {
  success: boolean
  data?: {
    containerNumber: string
    status: string
    location: string
    vessel?: string
    voyage?: string
    eta?: string
    events: Array<{
      date: string
      time: string
      location: string
      status: string
      description?: string
    }>
  }
  error?: string
  source: string
}

export class WebScrapingService {
  private browser: Browser | null = null
  private readonly userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      })
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async scrapeMaersk(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Navigate to Maersk tracking page
      const url = `https://www.maersk.com/tracking/${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      // Wait for tracking data to load
      await page.waitForSelector('[data-testid="tracking-results"]', { timeout: 10000 })

      // Extract tracking information
      const trackingData = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="container-number"]')?.textContent?.trim()
        const status = document.querySelector('[data-testid="shipment-status"]')?.textContent?.trim()
        const location = document.querySelector('[data-testid="current-location"]')?.textContent?.trim()
        const vessel = document.querySelector('[data-testid="vessel-name"]')?.textContent?.trim()
        const eta = document.querySelector('[data-testid="estimated-arrival"]')?.textContent?.trim()

        // Extract events timeline
        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const eventElements = document.querySelectorAll('[data-testid="tracking-event"]')

        eventElements.forEach((element) => {
          const date = element.querySelector('[data-testid="event-date"]')?.textContent?.trim() || ""
          const time = element.querySelector('[data-testid="event-time"]')?.textContent?.trim() || ""
          const eventLocation = element.querySelector('[data-testid="event-location"]')?.textContent?.trim() || ""
          const eventStatus = element.querySelector('[data-testid="event-status"]')?.textContent?.trim() || ""
          const description = element.querySelector('[data-testid="event-description"]')?.textContent?.trim()

          if (date && eventStatus) {
            events.push({
              date,
              time,
              location: eventLocation,
              status: eventStatus,
              description,
            })
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "Maersk Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "Maersk Website",
        }
      }
    } catch (error) {
      console.error("Maersk scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Maersk Website",
      }
    }
  }

  async scrapeMSC(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Navigate to MSC tracking page
      const url = `https://www.msc.com/track-a-shipment?agencyPath=msc&trackingNumber=${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      // Wait for tracking results
      await page.waitForSelector(".tracking-results, .shipment-details", { timeout: 10000 })

      const trackingData = await page.evaluate(() => {
        // MSC specific selectors (these would need to be updated based on actual MSC website structure)
        const container = document.querySelector('.container-number, [class*="container"]')?.textContent?.trim()
        const status = document.querySelector('.shipment-status, [class*="status"]')?.textContent?.trim()
        const location = document.querySelector('.current-location, [class*="location"]')?.textContent?.trim()
        const vessel = document.querySelector('.vessel-name, [class*="vessel"]')?.textContent?.trim()
        const eta = document.querySelector('.eta, [class*="arrival"]')?.textContent?.trim()

        // Extract events
        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const eventRows = document.querySelectorAll('.tracking-event, .event-row, [class*="event"]')

        eventRows.forEach((row) => {
          const date = row.querySelector('.date, [class*="date"]')?.textContent?.trim() || ""
          const time = row.querySelector('.time, [class*="time"]')?.textContent?.trim() || ""
          const eventLocation = row.querySelector('.location, [class*="location"]')?.textContent?.trim() || ""
          const eventStatus = row.querySelector('.status, [class*="status"]')?.textContent?.trim() || ""
          const description = row.querySelector('.description, [class*="description"]')?.textContent?.trim()

          if (date && eventStatus) {
            events.push({
              date,
              time,
              location: eventLocation,
              status: eventStatus,
              description,
            })
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "MSC Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "MSC Website",
        }
      }
    } catch (error) {
      console.error("MSC scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "MSC Website",
      }
    }
  }

  async scrapeCMAGCM(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Navigate to CMA CGM tracking page
      const url = `https://www.cma-cgm.com/ebusiness/tracking/search?number=${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      // Wait for tracking results
      await page.waitForSelector(".tracking-container, .shipment-info", { timeout: 10000 })

      const trackingData = await page.evaluate(() => {
        // CMA CGM specific selectors
        const container = document.querySelector('.container-ref, [class*="container-number"]')?.textContent?.trim()
        const status = document.querySelector('.shipment-status, [class*="current-status"]')?.textContent?.trim()
        const location = document.querySelector('.current-position, [class*="location"]')?.textContent?.trim()
        const vessel = document.querySelector('.vessel-info, [class*="vessel"]')?.textContent?.trim()
        const eta = document.querySelector('.estimated-arrival, [class*="eta"]')?.textContent?.trim()

        // Extract timeline events
        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const timelineItems = document.querySelectorAll('.timeline-item, .tracking-step, [class*="event"]')

        timelineItems.forEach((item) => {
          const date = item.querySelector('.event-date, [class*="date"]')?.textContent?.trim() || ""
          const time = item.querySelector('.event-time, [class*="time"]')?.textContent?.trim() || ""
          const eventLocation = item.querySelector('.event-location, [class*="location"]')?.textContent?.trim() || ""
          const eventStatus = item.querySelector('.event-status, [class*="status"]')?.textContent?.trim() || ""
          const description = item.querySelector('.event-details, [class*="description"]')?.textContent?.trim()

          if (date && eventStatus) {
            events.push({
              date,
              time,
              location: eventLocation,
              status: eventStatus,
              description,
            })
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "CMA CGM Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "CMA CGM Website",
        }
      }
    } catch (error) {
      console.error("CMA CGM scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "CMA CGM Website",
      }
    }
  }

  async scrapeHapagLloyd(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Navigate to Hapag-Lloyd tracking page
      const url = `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      // Wait for tracking results
      await page.waitForSelector(".tracking-result, .container-details", { timeout: 10000 })

      const trackingData = await page.evaluate(() => {
        // Hapag-Lloyd specific selectors
        const container = document.querySelector('.container-number, [data-testid="container"]')?.textContent?.trim()
        const status = document.querySelector('.container-status, [data-testid="status"]')?.textContent?.trim()
        const location = document.querySelector('.current-location, [data-testid="location"]')?.textContent?.trim()
        const vessel = document.querySelector('.vessel-name, [data-testid="vessel"]')?.textContent?.trim()
        const eta = document.querySelector('.arrival-date, [data-testid="eta"]')?.textContent?.trim()

        // Extract journey events
        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const journeySteps = document.querySelectorAll('.journey-step, .tracking-event, [class*="milestone"]')

        journeySteps.forEach((step) => {
          const date = step.querySelector('.step-date, [class*="date"]')?.textContent?.trim() || ""
          const time = step.querySelector('.step-time, [class*="time"]')?.textContent?.trim() || ""
          const eventLocation = step.querySelector('.step-location, [class*="location"]')?.textContent?.trim() || ""
          const eventStatus = step.querySelector('.step-status, [class*="status"]')?.textContent?.trim() || ""
          const description = step.querySelector('.step-description, [class*="details"]')?.textContent?.trim()

          if (date && eventStatus) {
            events.push({
              date,
              time,
              location: eventLocation,
              status: eventStatus,
              description,
            })
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "Hapag-Lloyd Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "Hapag-Lloyd Website",
        }
      }
    } catch (error) {
      console.error("Hapag-Lloyd scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Hapag-Lloyd Website",
      }
    }
  }

  async scrapeCOSCO(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      const url = `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      await page.waitForSelector(".tracking-info-table, .cargo-tracking-details", { timeout: 10000 })

      const trackingData = await page.evaluate(() => {
        const container = document
          .querySelector('.tracking-number-display, [class*="container-no"]')
          ?.textContent?.trim()
        const status = document.querySelector('.current-status-text, [class*="status-text"]')?.textContent?.trim()
        const location = document.querySelector('.current-location-text, [class*="location-text"]')?.textContent?.trim()
        const vessel = document.querySelector('.vessel-name-text, [class*="vessel-name"]')?.textContent?.trim()
        const eta = document.querySelector('.eta-text, [class*="eta-date"]')?.textContent?.trim()

        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const eventRows = document.querySelectorAll('.event-row, [class*="event-item"]')

        eventRows.forEach((row) => {
          const date = row.querySelector('.event-date, [class*="date"]')?.textContent?.trim() || ""
          const time = row.querySelector('.event-time, [class*="time"]')?.textContent?.trim() || ""
          const eventLocation = row.querySelector('.event-location, [class*="location"]')?.textContent?.trim() || ""
          const eventStatus = row.querySelector('.event-status, [class*="status"]')?.textContent?.trim() || ""
          const description = row.querySelector('.event-description, [class*="description"]')?.textContent?.trim()

          if (date && eventStatus) {
            events.push({
              date,
              time,
              location: eventLocation,
              status: eventStatus,
              description,
            })
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "COSCO Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "COSCO Website",
        }
      }
    } catch (error) {
      console.error("COSCO scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "COSCO Website",
      }
    }
  }

  async scrapeEvergreen(containerNumber: string): Promise<ScrapedTrackingData> {
    try {
      await this.initBrowser()
      const page = await this.browser!.newPage()

      await page.setUserAgent(this.userAgent)
      await page.setViewportSize({ width: 1920, height: 1080 })

      const url = `https://www.evergreen-line.com/emodal/stpb/stpb_show.do?lang=en&f_cmd=track&f_container_no=${containerNumber}`
      await page.goto(url, { waitUntil: "networkidle" })

      await page.waitForSelector("#trackingResultTable, .tracking-details-section", { timeout: 10000 })

      const trackingData = await page.evaluate(() => {
        const container = document
          .querySelector('#containerNoDisplay, [class*="container-number"]')
          ?.textContent?.trim()
        const status = document.querySelector('#currentStatusDisplay, [class*="current-status"]')?.textContent?.trim()
        const location = document
          .querySelector('#currentLocationDisplay, [class*="current-location"]')
          ?.textContent?.trim()
        const vessel = document.querySelector('#vesselNameDisplay, [class*="vessel-name"]')?.textContent?.trim()
        const eta = document.querySelector('#etaDisplay, [class*="eta-date"]')?.textContent?.trim()

        const events: Array<{ date: string; time: string; location: string; status: string; description?: string }> = []
        const eventRows = document.querySelectorAll('#eventTable tbody tr, [class*="event-row"]')

        eventRows.forEach((row) => {
          const cells = row.querySelectorAll("td")
          if (cells.length >= 4) {
            const date = cells[0]?.textContent?.trim() || ""
            const time = cells[1]?.textContent?.trim() || ""
            const eventLocation = cells[2]?.textContent?.trim() || ""
            const status = cells[3]?.textContent?.trim() || ""
            const description = cells[4]?.textContent?.trim() || "" // Assuming a description column

            if (date && status) {
              events.push({
                date,
                time,
                location: eventLocation,
                status: status,
                description: description,
              })
            }
          }
        })

        return {
          containerNumber: container,
          status,
          location,
          vessel,
          eta,
          events,
        }
      })

      await page.close()

      if (trackingData.containerNumber) {
        return {
          success: true,
          data: {
            containerNumber: trackingData.containerNumber,
            status: trackingData.status || "Unknown",
            location: trackingData.location || "Unknown",
            vessel: trackingData.vessel,
            eta: trackingData.eta,
            events: trackingData.events,
          },
          source: "Evergreen Website",
        }
      } else {
        return {
          success: false,
          error: "No tracking data found",
          source: "Evergreen Website",
        }
      }
    } catch (error) {
      console.error("Evergreen scraping error:", error)
      return {
        success: false,
        error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Evergreen Website",
      }
    }
  }

  async scrapeByCarrier(containerNumber: string, carrier: string): Promise<ScrapedTrackingData> {
    const cleanContainer = containerNumber.trim().toUpperCase()

    switch (carrier.toUpperCase()) {
      case "MAERSK":
        return await this.scrapeMaersk(cleanContainer)
      case "MSC":
        return await this.scrapeMSC(cleanContainer)
      case "CMA CGM":
      case "CMA-CGM":
        return await this.scrapeCMAGCM(cleanContainer)
      case "HAPAG-LLOYD":
      case "HAPAG LLOYD":
        return await this.scrapeHapagLloyd(cleanContainer)
      case "COSCO":
        return await this.scrapeCOSCO(cleanContainer)
      case "EVERGREEN":
        return await this.scrapeEvergreen(cleanContainer)
      default:
        return {
          success: false,
          error: `Scraping not supported for carrier: ${carrier}`,
          source: "Web Scraping Service",
        }
    }
  }

  // Auto-detect carrier and scrape
  async scrapeContainer(containerNumber: string): Promise<ScrapedTrackingData> {
    const cleanContainer = containerNumber.trim().toUpperCase()
    const prefix = cleanContainer.substring(0, 4)

    // Map container prefixes to carriers
    const carrierMap: Record<string, string> = {
      MAEU: "MAERSK",
      MRKU: "MAERSK",
      MSKU: "MAERSK",
      MSCU: "MSC",
      MEDU: "MSC",
      CMAU: "CMA CGM",
      CXDU: "CMA CGM",
      HLXU: "HAPAG-LLOYD",
      HLCU: "HAPAG-LLOYD",
      COSU: "COSCO", // Added COSCO
      CBHU: "COSCO", // Added COSCO
      EVRU: "EVERGREEN", // Added Evergreen
      EGHU: "EVERGREEN", // Added Evergreen
    }

    const carrier = carrierMap[prefix]
    if (carrier) {
      return await this.scrapeByCarrier(cleanContainer, carrier)
    } else {
      return {
        success: false,
        error: `Unknown container prefix: ${prefix}. Scraping not available.`,
        source: "Web Scraping Service",
      }
    }
  }
}

// Singleton instance
export const webScrapingService = new WebScrapingService()
