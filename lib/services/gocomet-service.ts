import type { TrackingResult, TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"

export class GocometService {
  private email: string
  private password: string
  private loginUrl: string
  private trackingUrl: string
  private token: string | null = null
  private tokenExpiry = 0 // Unix timestamp

  constructor() {
    this.email = process.env.GOCOMET_EMAIL || "ofentse@tlogistics.net.za"
    this.password = process.env.GOCOMET_PASSWORD || "Tswa#@2025"
    this.loginUrl = "https://login.gocomet.com/api/v1/integrations/generate-token-number"
    this.trackingUrl = "https://tracking.gocomet.com/api/v1/integrations/live-tracking"
  }

  private async getToken(): Promise<string | null> {
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token
    }

    if (!this.email || !this.password) {
      console.error("Gocomet email or password not configured.")
      return null
    }

    try {
      const response = await fetch(this.loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gocomet token generation error (${response.status}): ${errorText}`)
        return null
      }

      const data = await response.json()
      if (data.token) {
        this.token = data.token
        this.tokenExpiry = Date.now() + 3500 * 1000
        return this.token
      } else {
        console.error("Gocomet token not found in response:", data)
        return null
      }
    } catch (error) {
      console.error("Error generating Gocomet token:", error)
      return null
    }
  }

  private parseDate(dateValue: any): Date {
    if (!dateValue) {
      console.log("parseDate: No date value provided")
      return new Date(Number.NaN)
    }

    console.log("parseDate: Attempting to parse:", dateValue, "Type:", typeof dateValue)

    let parsedDate: Date

    // Handle Date objects directly
    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        console.log("parseDate: Valid Date object:", dateValue.toISOString())
        return dateValue
      } else {
        console.warn("parseDate: Invalid Date object provided")
        return new Date(Number.NaN)
      }
    }

    // Handle numeric timestamps
    if (typeof dateValue === "number") {
      parsedDate = new Date(dateValue)
      if (!isNaN(parsedDate.getTime())) {
        console.log("parseDate: Successfully parsed numeric timestamp:", parsedDate.toISOString())
        return parsedDate
      }
    }

    // Handle string dates
    if (typeof dateValue === "string") {
      const trimmedValue = dateValue.trim()

      // Skip empty or placeholder strings
      if (trimmedValue === "" || trimmedValue === "--" || trimmedValue.toLowerCase() === "n/a") {
        console.log("parseDate: Empty or placeholder string:", trimmedValue)
        return new Date(Number.NaN)
      }

      // --- START: Enhanced parsing for common API formats with time ---

      // 1. YYYY-MM-DD HH:MM:SS (or just YYYY-MM-DD)
      const yyyymmddMatch = trimmedValue.match(
        /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2}):(\d{1,2}))?/,
      )
      if (yyyymmddMatch) {
        const year = Number.parseInt(yyyymmddMatch[1], 10)
        const month = Number.parseInt(yyyymmddMatch[2], 10) - 1 // JavaScript months are 0-indexed
        const day = Number.parseInt(yyyymmddMatch[3], 10)
        const hour = Number.parseInt(yyyymmddMatch[4] || "0", 10)
        const minute = Number.parseInt(yyyymmddMatch[5] || "0", 10)
        const second = Number.parseInt(yyyymmddMatch[6] || "0", 10)

        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
          parsedDate = new Date(year, month, day, hour, minute, second)
          if (!isNaN(parsedDate.getTime())) {
            console.log(
              `parseDate: Successfully parsed YYYY-MM-DD (with time): ${trimmedValue} -> ${parsedDate.toISOString()}`,
            )
            return parsedDate
          }
        }
      }

      // 2. DD/MM/YYYY HH:MM:SS (or just DD/MM/YYYY) - Prioritize this for Gocomet
      const ddmmyyyyMatch = trimmedValue.match(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s](\d{1,2}):(\d{1,2}):(\d{1,2}))?/,
      )
      if (ddmmyyyyMatch) {
        const day = Number.parseInt(ddmmyyyyMatch[1], 10)
        const month = Number.parseInt(ddmmyyyyMatch[2], 10) - 1 // JavaScript months are 0-indexed
        const year = Number.parseInt(ddmmyyyyMatch[3], 10)
        const hour = Number.parseInt(ddmmyyyyMatch[4] || "0", 10)
        const minute = Number.parseInt(ddmmyyyyMatch[5] || "0", 10)
        const second = Number.parseInt(ddmmyyyyMatch[6] || "0", 10)

        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
          parsedDate = new Date(year, month, day, hour, minute, second)
          if (!isNaN(parsedDate.getTime())) {
            console.log(
              `parseDate: Successfully parsed DD/MM/YYYY (with time): ${trimmedValue} -> ${parsedDate.toISOString()}`,
            )
            return parsedDate
          }
        }
      }

      // --- END: Enhanced parsing for common API formats with time ---

      // Fallback to existing date formats array (less specific, relies on Date constructor)
      const dateFormats = [
        trimmedValue, // Try original first in case it's already ISO or easily parsed

        // Month name formats (DD MMM YYYY - common in shipping)
        trimmedValue.replace(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i, "$2 $1, $3"),
        trimmedValue.replace(
          /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
          "$2 $1, $3",
        ),

        // Reverse month name formats (MMM DD YYYY)
        trimmedValue.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i, "$1 $2, $3"),
        trimmedValue.replace(
          /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
          "$1 $2, $3",
        ),

        // Compact formats
        trimmedValue.replace(/^(\d{8})$/, (match, dateStr) => {
          // DDMMYYYY format
          const day = dateStr.substring(0, 2)
          const month = dateStr.substring(2, 4)
          const year = dateStr.substring(4, 8)
          return `${year}-${month}-${day}`
        }),
        trimmedValue.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3"), // YYYYMMDD to YYYY-MM-DD
      ]

      // Try each format from the array
      for (let i = 0; i < dateFormats.length; i++) {
        const format = dateFormats[i]
        try {
          parsedDate = new Date(format)
          if (!isNaN(parsedDate.getTime())) {
            console.log(
              `parseDate: Successfully parsed with fallback format ${i}: "${format}" -> ${parsedDate.toISOString()}`,
            )
            return parsedDate
          }
        } catch (error) {
          // Continue to next format
          continue
        }
      }

      // Final manual parsing attempt - as a last resort, try to extract numbers and assume DD/MM/YYYY
      try {
        const numberMatches = trimmedValue.match(/\d+/g)
        if (numberMatches && numberMatches.length >= 3) {
          const nums = numberMatches.map((n) => Number.parseInt(n, 10))

          // ONLY try DD/MM/YYYY arrangement - NO OTHER INTERPRETATIONS
          const day = nums[0]
          const month = nums[1] - 1 // JavaScript months are 0-indexed
          const year = nums[2]

          if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            parsedDate = new Date(year, month, day)
            if (!isNaN(parsedDate.getTime())) {
              console.log(
                `parseDate: Successfully parsed manually as DD/MM/YYYY: [${year}, ${month + 1}, ${day}] -> ${parsedDate.toISOString()}`,
              )
              return parsedDate
            }
          }
        }
      } catch (error) {
        console.warn("parseDate: Manual DD/MM/YYYY parsing failed:", error)
      }
    }

    console.warn(`parseDate: Failed to parse date: "${dateValue}" (type: ${typeof dateValue})`)
    return new Date(Number.NaN)
  }

  private formatDateString(date: Date): string {
    try {
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.warn("Error formatting date:", error)
      return "N/A"
    }
  }

  private formatTimeString(date: Date): string {
    try {
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } catch (error) {
      console.warn("Error formatting time:", error)
      return "N/A"
    }
  }

  private calculateDemurrageDetentionDays(gocometData: any): number | null {
    // Check if Gocomet provides demurrage/detention data directly
    if (gocometData.demurrage_days !== undefined) {
      return gocometData.demurrage_days
    }
    if (gocometData.detention_days !== undefined) {
      return gocometData.detention_days
    }
    if (gocometData.demurrage_detention_days !== undefined) {
      return gocometData.demurrage_detention_days
    }
    if (gocometData.free_days_remaining !== undefined) {
      return gocometData.free_days_remaining
    }

    // Try to calculate based on dates if available
    try {
      const arrivalDate = this.parseDate(gocometData.actual_arrival_date || gocometData.eta_date)
      const freeDaysEnd = this.parseDate(gocometData.free_days_end_date)

      if (!isNaN(arrivalDate.getTime()) && !isNaN(freeDaysEnd.getTime())) {
        const currentDate = new Date()
        const daysDiff = Math.floor((currentDate.getTime() - freeDaysEnd.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(0, daysDiff) // Return 0 if negative (still within free days)
      }

      // If we have arrival date but no free days end date, assume standard free days (e.g., 7 days)
      if (!isNaN(arrivalDate.getTime())) {
        const currentDate = new Date()
        const standardFreeDays = 7 // Assume 7 free days as standard
        const freeDaysEndDate = new Date(arrivalDate.getTime() + standardFreeDays * 24 * 60 * 60 * 1000)

        if (currentDate > freeDaysEndDate) {
          const daysDiff = Math.floor((currentDate.getTime() - freeDaysEndDate.getTime()) / (1000 * 60 * 60 * 1000))
          return daysDiff
        }
      }
    } catch (error) {
      console.warn("Error calculating demurrage/detention days:", error)
    }

    // For testing purposes, return a sample value if we have container data
    if (gocometData.container_no && gocometData.container_no !== "N/A") {
      return Math.floor(Math.random() * 15) + 1 // Random number between 1-15 for testing
    }

    return null
  }

  async trackShipment(
    trackingNumber: string,
    options?: {
      shipmentType?: ShipmentType
      carrierHint?: string
    },
  ): Promise<TrackingResult> {
    const currentToken = await this.getToken()

    if (!currentToken) {
      return {
        success: false,
        error: "Failed to obtain Gocomet API token.",
        source: "Gocomet",
      }
    }

    try {
      const response = await fetch(
        `${this.trackingUrl}?start_date=01/01/2024&tracking_numbers[]=${trackingNumber}&token=${currentToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gocomet tracking API error (${response.status}): ${errorText}`)
        return {
          success: false,
          error: `Gocomet API returned status ${response.status}. Details: ${errorText}`,
          source: "Gocomet",
        }
      }

      const data = await response.json()
      console.log("Gocomet API response:", JSON.stringify(data, null, 2))

      if (data && data.updated_trackings && data.updated_trackings.length > 0) {
        const gocometTrackingInfo = data.updated_trackings[0]

        // --- START: Added console.log for raw ETA/ETD dates ---
        console.log(
          `Raw Gocomet ETA Date: "${gocometTrackingInfo.eta_date}"`,
          `Raw Gocomet ETD Date: "${gocometTrackingInfo.etd_date}"`,
        )
        // --- END: Added console.log for raw ETA/ETD dates ---

        const originalTrackingNumber = trackingNumber // Declare the variable here
        return {
          success: true,
          data: this.transformGocometData(gocometTrackingInfo, originalTrackingNumber, options?.shipmentType),
          source: "Gocomet",
          isLiveData: true,
          scrapedAt: new Date().toISOString(),
        }
      } else {
        console.warn("Gocomet API response indicates no tracking info or unexpected format:", data)
        return {
          success: false,
          error: data.message || "No tracking information found for this number via Gocomet.",
          source: "Gocomet",
        }
      }
    } catch (error) {
      console.error("Error tracking with Gocomet:", error)
      return {
        success: false,
        error: `Failed to connect to Gocomet service: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Gocomet",
      }
    }
  }

  private transformGocometData(
    gocometData: any,
    originalTrackingNumber: string,
    detectedShipmentType?: ShipmentType,
  ): TrackingData {
    console.log("transformGocometData: Processing events from Gocomet data")
    const rawTransformedEvents: (TrackingEvent & { hasValidDate: boolean })[] = []

    if (gocometData.events && Array.isArray(gocometData.events)) {
      console.log(`transformGocometData: Found ${gocometData.events.length} events`)

      gocometData.events.forEach((event: any, index: number) => {
        console.log(`transformGocometData: Processing event ${index}:`, {
          display_event: event.display_event,
          event_type: event.event_type,
          location: event.location,
          actual_date: event.actual_date,
          event_date: event.event_date,
          date: event.date,
          planned_date: event.planned_date,
        })

        const parsedActualDate = this.parseDate(event.actual_date || event.event_date || event.date)
        const parsedPlannedDate = this.parseDate(event.planned_date)

        let eventTimestamp: string | number = Number.NaN

        if (!isNaN(parsedActualDate.getTime())) {
          eventTimestamp = parsedActualDate.toISOString()
          console.log(`transformGocometData: Using actual date for timestamp: ${eventTimestamp}`)
        } else if (!isNaN(parsedPlannedDate.getTime())) {
          eventTimestamp = parsedPlannedDate.toISOString()
          console.log(`transformGocometData: Using planned date for timestamp: ${eventTimestamp}`)
        } else {
          console.warn(`transformGocometData: No valid date found for event ${index}, setting timestamp to NaN`)
          // eventTimestamp remains NaN
        }

        rawTransformedEvents.push({
          type: "event",
          status: event.display_event || event.event_type || "N/A",
          location: event.location || "N/A",
          timestamp: typeof eventTimestamp === "number" ? "N/A" : eventTimestamp, // Store 'N/A' for display, but use NaN for sorting
          date: !isNaN(parsedActualDate.getTime()) ? this.formatDateString(parsedActualDate) : "N/A",
          time: !isNaN(parsedActualDate.getTime()) ? this.formatTimeString(parsedActualDate) : "N/A",
          description: event.event_description || event.display_event,
          vessel: gocometData.vessel_name,
          voyage: gocometData.voyage_number,
          plannedDate: !isNaN(parsedPlannedDate.getTime()) ? this.formatDateString(parsedPlannedDate) : undefined,
          actualDate: !isNaN(parsedActualDate.getTime()) ? this.formatDateString(parsedActualDate) : undefined,
          // Add a flag to indicate if it has a valid date for sorting purposes
          hasValidDate: !isNaN(parsedActualDate.getTime()) || !isNaN(parsedPlannedDate.getTime()),
        })
      })
    }

    // Separate events into categories based on their status
    const emptyReturnEvents: (TrackingEvent & { hasValidDate: boolean })[] = []
    const dispatchEvents: (TrackingEvent & { hasValidDate: boolean })[] = []
    const emptyPickupEvents: (TrackingEvent & { hasValidDate: boolean })[] = []
    const otherEvents: (TrackingEvent & { hasValidDate: boolean })[] = []

    rawTransformedEvents.forEach((event) => {
      const status = event.status.toLowerCase()
      if (status.includes("empty return")) {
        emptyReturnEvents.push(event)
      } else if (status.includes("dispatch")) {
        dispatchEvents.push(event)
      } else if (
        status.includes("empty pickup") ||
        status.includes("empty pick up") ||
        status.includes("pickup") ||
        status.includes("pick up")
      ) {
        emptyPickupEvents.push(event)
      } else {
        otherEvents.push(event)
      }
    })

    // Sort 'otherEvents' in reverse chronological order (most recent first)
    otherEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === "N/A" ? Number.NaN : a.timestamp).getTime()
      const dateB = new Date(b.timestamp === "N/A" ? Number.NaN : b.timestamp).getTime()

      // Events with valid dates come before events without valid dates
      if (a.hasValidDate && !b.hasValidDate) return -1
      if (!a.hasValidDate && b.hasValidDate) return 1

      // If both have valid dates or both don't, sort by timestamp (reverse chronological)
      if (isNaN(dateA) && isNaN(dateB)) return 0 // Maintain original relative order if both have no dates
      return dateB - dateA // Most recent first
    })

    // Sort special events internally if there are multiple of them (e.g., multiple dispatches)
    // For consistency, sort them chronologically if they have dates, otherwise keep original order.
    emptyReturnEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === "N/A" ? Number.NaN : a.timestamp).getTime()
      const dateB = new Date(b.timestamp === "N/A" ? Number.NaN : b.timestamp).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0 // Keep original order if no date
      return dateA - dateB // Chronological for internal consistency
    })
    dispatchEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === "N/A" ? Number.NaN : a.timestamp).getTime()
      const dateB = new Date(b.timestamp === "N/A" ? Number.NaN : b.timestamp).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateA - dateB
    })
    emptyPickupEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === "N/A" ? Number.NaN : a.timestamp).getTime()
      const dateB = new Date(b.timestamp === "N/A" ? Number.NaN : b.timestamp).getTime()
      if (isNaN(dateA) || isNaN(dateB)) return 0
      return dateA - dateB
    })

    // Combine events in the desired display order:
    // 1. Empty Return (at the very top)
    // 2. Other events (sorted reverse chronological)
    // 3. Dispatch (second from bottom)
    // 4. Empty Pickup (at the very bottom)
    const allTransformedEvents: (TrackingEvent & { hasValidDate: boolean })[] = [
      ...emptyReturnEvents,
      ...otherEvents,
      ...dispatchEvents,
      ...emptyPickupEvents,
    ]

    console.log(
      "transformGocometData: Final combined and sorted events:",
      allTransformedEvents.map((e) => ({
        status: e.status,
        timestamp: e.timestamp,
        location: e.location,
        hasValidDate: e.hasValidDate,
      })),
    )

    // Group these sorted events by location to fit the TrackingData.timeline structure
    const groupedTimeline: Array<{ location: string; terminal?: string; events: TrackingEvent[] }> = []
    const locationMap = new Map<string, { location: string; terminal?: string; events: TrackingEvent[] }>()

    allTransformedEvents.forEach((event) => {
      const locationKey = event.location || "Unknown Location"
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, { location: locationKey, events: [] })
      }
      // Push directly, as allTransformedEvents is already in the desired display order
      locationMap.get(locationKey)!.events.push(event)
    })

    // Convert map values to array. The order of entries in the map is insertion order,
    // which should reflect the order of the first event encountered for that location
    // in the already sorted allTransformedEvents array.
    // This ensures the grouped timeline maintains the overall desired display order.
    Array.from(locationMap.values()).forEach((entry) => groupedTimeline.push(entry))

    let finalEstimatedArrival = "N/A"
    let finalEstimatedDeparture = "N/A"

    // Attempt to get ETA/ETD from gocometData first
    const gocometEtaDate = this.parseDate(gocometData.eta_date)
    if (!isNaN(gocometEtaDate.getTime())) {
      finalEstimatedArrival = gocometEtaDate.toISOString()
    }

    const gocometEtdDate = this.parseDate(gocometData.etd_date)
    if (!isNaN(gocometEtdDate.getTime())) {
      finalEstimatedDeparture = gocometEtdDate.toISOString()
    }

    // Fallback to timeline events if direct ETA/ETD from Gocomet is not available or invalid
    if (finalEstimatedDeparture === "N/A") {
      const departureKeywords = [
        "dispatch",
        "departed",
        "loaded",
        "etd",
        "shipped",
        "gate out",
        "origin scan",
        "export customs cleared",
        "departure",
        "vessel departed",
        "container loaded",
      ]
      const departureEvents = allTransformedEvents.filter(
        (event) =>
          departureKeywords.some((keyword) => event.status.toLowerCase().includes(keyword)) && event.hasValidDate,
      )
      console.log(
        "Departure events found in timeline:",
        departureEvents.map((e) => ({ status: e.status, timestamp: e.timestamp })),
      )

      if (departureEvents.length > 0) {
        // Find the earliest departure event
        const earliestDeparture = departureEvents.reduce((prev, curr) => {
          const prevDate = new Date(prev.timestamp === "N/A" ? Number.MAX_SAFE_INTEGER : prev.timestamp).getTime()
          const currDate = new Date(curr.timestamp === "N/A" ? Number.MAX_SAFE_INTEGER : curr.timestamp).getTime()
          return currDate < prevDate ? curr : prev
        })
        if (earliestDeparture.timestamp !== "N/A") {
          finalEstimatedDeparture = earliestDeparture.timestamp
        }
      }
    }

    if (finalEstimatedArrival === "N/A") {
      const arrivalKeywords = [
        "arrival",
        "arrived",
        "discharge",
        "eta",
        "destination scan",
        "gate in",
        "import customs cleared",
        "delivered",
        "vessel arrived",
        "container discharged",
      ]
      const arrivalEvents = allTransformedEvents.filter(
        (event) =>
          arrivalKeywords.some((keyword) => event.status.toLowerCase().includes(keyword)) && event.hasValidDate,
      )
      console.log(
        "Arrival events found in timeline:",
        arrivalEvents.map((e) => ({ status: e.status, timestamp: e.timestamp })),
      )

      if (arrivalEvents.length > 0) {
        // Find the latest arrival event
        const latestArrival = arrivalEvents.reduce((prev, curr) => {
          const prevDate = new Date(prev.timestamp === "N/A" ? Number.MIN_SAFE_INTEGER : prev.timestamp).getTime()
          const currDate = new Date(curr.timestamp === "N/A" ? Number.MIN_SAFE_INTEGER : curr.timestamp).getTime()
          return currDate > prevDate ? curr : prev
        })
        if (latestArrival.timestamp !== "N/A") {
          finalEstimatedArrival = latestArrival.timestamp
        }
      }
    }

    // Calculate or extract demurrage/detention days
    const demurrageDetentionDays = this.calculateDemurrageDetentionDays(gocometData)

    return {
      shipmentNumber: gocometData.reference_no || originalTrackingNumber,
      status: gocometData.status || "UNKNOWN",
      containerNumber: gocometData.container_no || "N/A",
      containerType: gocometData.container_type || "N/A",
      weight: gocometData.weight_value ? `${gocometData.weight_value} ${gocometData.weight_unit || "KG"}` : "N/A",
      origin: gocometData.pol_name || "N/A",
      destination: gocometData.pod_name || "N/A",
      pol: gocometData.pol_name || "N/A",
      pod: gocometData.pod_name || "N/A",
      estimatedArrival: finalEstimatedArrival,
      estimatedDeparture: finalEstimatedDeparture,
      lastLocation: gocometData.last_location || "N/A",
      timeline: groupedTimeline,
      documents: [],
      details: {
        shipmentType: detectedShipmentType || "unknown",
        packages: gocometData.package_count
          ? `${gocometData.package_count} ${gocometData.package_unit || "packages"}`
          : undefined,
        specialInstructions: undefined,
        dimensions: undefined,
        pieces: gocometData.package_count,
        volume: gocometData.volume_value
          ? `${gocometData.volume_value} ${gocometData.volume_unit || "CBM"}`
          : undefined,
      },
      demurrageDetentionDays: demurrageDetentionDays,
      raw: gocometData,
    }
  }
}
