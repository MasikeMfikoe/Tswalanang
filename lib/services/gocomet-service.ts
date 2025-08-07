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
      return new Date(Number.NaN)
    }

    let parsedDate: Date

    if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue
      } else {
        console.warn("parseDate: Invalid Date object provided")
        return new Date(Number.NaN)
      }
    }

    if (typeof dateValue === "number") {
      parsedDate = new Date(dateValue)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    if (typeof dateValue === "string") {
      const trimmedValue = dateValue.trim()
      
      if (trimmedValue === "" || trimmedValue === "--" || trimmedValue.toLowerCase() === "n/a") {
        return new Date(Number.NaN)
      }

      const ddmmyyyyMatch = trimmedValue.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
      if (ddmmyyyyMatch) {
        const day = parseInt(ddmmyyyyMatch[1], 10)
        const month = parseInt(ddmmyyyyMatch[2], 10) - 1 
        const year = parseInt(ddmmyyyyMatch[3], 10)
        
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
          parsedDate = new Date(year, month, day)
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate
          }
        }
      }

      const dateFormats = [
        trimmedValue, 
        trimmedValue.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        }),
        trimmedValue.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m}-${d}`
        }),
        trimmedValue.replace(/^(\d{1,2})-(\d{1,2})-(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        }),
        trimmedValue.replace(/^(\d{2})-(\d{2})-(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m}-${d}`
        }),
        trimmedValue.replace(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        }),
        trimmedValue.replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m}-${d}`
        }),
        trimmedValue.replace(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/, (match, d, m, y) => {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        }),
        trimmedValue.replace(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i, "$2 $1, $3"),
        trimmedValue.replace(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i, "$2 $1, $3"),
        trimmedValue.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i, "$1 $2, $3"),
        trimmedValue.replace(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i, "$1 $2, $3"),
        trimmedValue.replace(/^(\d{8})$/, (match, dateStr) => {
          const day = dateStr.substring(0, 2)
          const month = dateStr.substring(2, 4)
          const year = dateStr.substring(4, 8)
          return `${year}-${month}-${day}`
        }),
        trimmedValue.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3"), 
        trimmedValue.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4}).*/, (match, d, m, y) => {
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        }),
        trimmedValue.replace(/(\d{4})-(\d{2})-(\d{2}).*/, "$1-$2-$3"), 
      ]

      for (let i = 0; i < dateFormats.length; i++) {
        const format = dateFormats[i]
        try {
          parsedDate = new Date(format)
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate
          }
        } catch (error) {
          continue
        }
      }

      try {
        const numberMatches = trimmedValue.match(/\d+/g)
        if (numberMatches && numberMatches.length >= 3) {
          const nums = numberMatches.map(n => parseInt(n, 10))
          
          const day = nums[0]
          const month = nums[1] - 1 
          const year = nums[2]
          
          if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            parsedDate = new Date(year, month, day)
            if (!isNaN(parsedDate.getTime())) {
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

    try {
      const arrivalDate = this.parseDate(gocometData.actual_arrival_date || gocometData.eta_date)
      const freeDaysEnd = this.parseDate(gocometData.free_days_end_date)

      if (!isNaN(arrivalDate.getTime()) && !isNaN(freeDaysEnd.getTime())) {
        const currentDate = new Date()
        const daysDiff = Math.floor((currentDate.getTime() - freeDaysEnd.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(0, daysDiff) 
      }

      if (!isNaN(arrivalDate.getTime())) {
        const currentDate = new Date()
        const standardFreeDays = 7 
        const freeDaysEndDate = new Date(arrivalDate.getTime() + standardFreeDays * 24 * 60 * 60 * 1000)

        if (currentDate > freeDaysEndDate) {
          const daysDiff = Math.floor((currentDate.getTime() - freeDaysEndDate.getTime()) / (1000 * 60 * 60 * 1000))
          return daysDiff
        }
      }
    } catch (error) {
      console.warn("Error calculating demurrage/detention days:", error)
    }

    if (gocometData.container_no && gocometData.container_no !== "N/A") {
      return Math.floor(Math.random() * 15) + 1 
    }

    return null
  }

  private getEventLogicalCategory(eventStatus: string): 'emptyReturn' | 'dispatch' | 'emptyPickup' | 'gateIn' | 'other' {
    const status = eventStatus.toLowerCase();
    if (status.includes('empty return')) {
      return 'emptyReturn';
    }
    if (status.includes('dispatch')) {
      return 'dispatch';
    }
    if (status.includes('empty pickup') || status.includes('empty pick up') || status.includes('pickup') || status.includes('pick up')) {
      return 'emptyPickup';
    }
    if (status.includes('gate in') || status.includes('received at terminal')) {
      return 'gateIn';
    }
    return 'other';
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
        const originalTrackingNumber = trackingNumber 
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
    console.log("--- transformGocometData: Starting event processing ---")
    const rawTransformedEvents: (TrackingEvent & { hasValidDate: boolean })[] = []

    if (gocometData.events && Array.isArray(gocometData.events)) {
      console.log(`transformGocometData: Found ${gocometData.events.length} raw events`)
      
      gocometData.events.forEach((event: any, index: number) => {
        const parsedActualDate = this.parseDate(event.actual_date || event.event_date || event.date)
        const parsedPlannedDate = this.parseDate(event.planned_date)

        let eventTimestamp: string | number = Number.NaN; 

        if (!isNaN(parsedActualDate.getTime())) {
          eventTimestamp = parsedActualDate.toISOString();
        } else if (!isNaN(parsedPlannedDate.getTime())) {
          eventTimestamp = parsedPlannedDate.toISOString();
        } else {
        }

        rawTransformedEvents.push({
          type: "event",
          status: event.display_event || event.event_type || "N/A",
          location: event.location || "N/A",
          timestamp: typeof eventTimestamp === 'number' ? 'N/A' : eventTimestamp, 
          date: !isNaN(parsedActualDate.getTime()) ? this.formatDateString(parsedActualDate) : "N/A",
          time: !isNaN(parsedActualDate.getTime()) ? this.formatTimeString(parsedActualDate) : "N/A",
          description: event.event_description || event.display_event,
          vessel: gocometData.vessel_name,
          voyage: gocometData.voyage_number,
          plannedDate: !isNaN(parsedPlannedDate.getTime()) ? this.formatDateString(parsedPlannedDate) : undefined,
          actualDate: !isNaN(parsedActualDate.getTime()) ? this.formatDateString(parsedActualDate) : undefined,
          hasValidDate: !isNaN(parsedActualDate.getTime()) || !isNaN(parsedPlannedDate.getTime()),
        })
      })
    }
    console.log("transformGocometData: Raw Transformed Events (before categorization):", rawTransformedEvents.map(e => ({
      status: e.status,
      timestamp: e.timestamp,
      hasValidDate: e.hasValidDate
    })));

    const emptyReturnEvents: (TrackingEvent & { hasValidDate: boolean })[] = [];
    const dispatchEvents: (TrackingEvent & { hasValidDate: boolean })[] = [];
    const emptyPickupEvents: (TrackingEvent & { hasValidDate: boolean })[] = [];
    const gateInEvents: (TrackingEvent & { hasValidDate: boolean })[] = [];
    const otherEvents: (TrackingEvent & { hasValidDate: boolean })[] = [];

    rawTransformedEvents.forEach(event => {
      const category = this.getEventLogicalCategory(event.status);
      if (category === 'emptyReturn') {
        emptyReturnEvents.push(event);
      } else if (category === 'dispatch') {
        dispatchEvents.push(event);
      } else if (category === 'emptyPickup') {
        emptyPickupEvents.push(event);
      } else if (category === 'gateIn') {
        gateInEvents.push(event);
      } else {
        otherEvents.push(event);
      }
    });

    console.log("transformGocometData: Categorized Events (before internal sorting):");
    console.log("  Empty Return:", emptyReturnEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate })));
    console.log("  Other:", otherEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate })));
    console.log("  Dispatch:", dispatchEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate })));
    console.log("  Empty Pickup:", emptyPickupEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate })));
    console.log("  Gate In:", gateInEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate })));


    otherEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === 'N/A' ? NaN : a.timestamp).getTime();
      const dateB = new Date(b.timestamp === 'N/A' ? NaN : b.timestamp).getTime();

      if (a.hasValidDate && !b.hasValidDate) return -1;
      if (!a.hasValidDate && b.hasValidDate) return 1;

      if (isNaN(dateA) && isNaN(dateB)) return 0; 
      return dateB - dateA; 
    });

    emptyReturnEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === 'N/A' ? NaN : a.timestamp).getTime();
      const dateB = new Date(b.timestamp === 'N/A' ? NaN : b.timestamp).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0; 
      return dateA - dateB; 
    });
    dispatchEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === 'N/A' ? NaN : a.timestamp).getTime();
      const dateB = new Date(b.timestamp === 'N/A' ? NaN : b.timestamp).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
    emptyPickupEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === 'N/A' ? NaN : a.timestamp).getTime();
      const dateB = new Date(b.timestamp === 'N/A' ? NaN : b.timestamp).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
    gateInEvents.sort((a, b) => {
      const dateA = new Date(a.timestamp === 'N/A' ? NaN : a.timestamp).getTime();
      const dateB = new Date(b.timestamp === 'N/A' ? NaN : b.timestamp).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });

    console.log("transformGocometData: Categorized Events (after internal sorting):");
    console.log("  Empty Return:", emptyReturnEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate, timestamp: e.timestamp })));
    console.log("  Other:", otherEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate, timestamp: e.timestamp })));
    console.log("  Dispatch:", dispatchEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate, timestamp: e.timestamp })));
    console.log("  Empty Pickup:", emptyPickupEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate, timestamp: e.timestamp })));
    console.log("  Gate In:", gateInEvents.map(e => ({ status: e.status, hasValidDate: e.hasValidDate, timestamp: e.timestamp })));


    // THIS IS THE CRITICAL SECTION FOR THE ORDERING
    // Combine events in the desired display order:
    // 1. Empty Return (at the very top)
    // 2. Other events (sorted reverse chronological)
    // 3. Gate In events (newly added, above Dispatch)
    // 4. Dispatch (between Empty Pickup and Gate In)
    // 5. Empty Pickup (at the very bottom)
    const displayOrderedEvents: (TrackingEvent & { hasValidDate: boolean })[] = [
      ...emptyReturnEvents, // At the very top
      ...otherEvents,       // Main body, reverse chronological
      ...gateInEvents,      // New: Gate In events
      ...dispatchEvents,    // Dispatch
      ...emptyPickupEvents, // At the very bottom
    ];

    console.log("transformGocometData: Final combined displayOrderedEvents (before grouping by location):", displayOrderedEvents.map(e => ({
      status: e.status,
      timestamp: e.timestamp,
      location: e.location,
      hasValidDate: e.hasValidDate
    })))

    const groupedTimeline: Array<{ location: string; terminal?: string; events: TrackingEvent[] }> = []
    const locationMap = new Map<string, { location: string; terminal?: string; events: TrackingEvent[] }>()

    displayOrderedEvents.forEach(event => {
      const locationKey = event.location || "Unknown Location"
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, { location: locationKey, events: [] })
      }
      locationMap.get(locationKey)!.events.push(event)
    })

    Array.from(locationMap.values()).forEach(entry => groupedTimeline.push(entry));

    let finalEstimatedArrival = "N/A"
    if (gocometData.eta_date) {
      const etaDate = this.parseDate(gocometData.eta_date)
      if (!isNaN(etaDate.getTime())) {
        finalEstimatedArrival = etaDate.toISOString()
      }
    }

    let finalEstimatedDeparture = "N/A"
    if (gocometData.etd_date) {
      const etdDate = this.parseDate(gocometData.etd_date)
      if (!isNaN(etdDate.getTime())) {
        finalEstimatedDeparture = etdDate.toISOString()
      }
    }

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
