import type { TrackingResult, TrackingData, TrackingEvent } from "@/types/tracking"

interface GocometToken {
  token: string
  expiresAt: number // Unix timestamp in milliseconds
}

let tokenCache: GocometToken | null = null

export class GocometService {
  private GOCOMET_LOGIN_URL = "https://login.gocomet.com/api/v1/integrations/generate-token-number"
  private GOCOMET_TRACKING_URL = "https://tracking.gocomet.com/api/v1/integrations/live-tracking"
  private GOCOMET_EMAIL = process.env.GOCOMET_EMAIL || "ofentse@tlogistics.net.za" // Fallback for local dev
  private GOCOMET_PASSWORD = process.env.GOCOMET_PASSWORD || "Tswa#@2025" // Fallback for local dev

  constructor() {
    if (!this.GOCOMET_EMAIL || !this.GOCOMET_PASSWORD) {
      console.warn("GOCOMET_EMAIL or GOCOMET_PASSWORD environment variables are not set. Using fallback credentials.")
    }
  }

  private async generateToken(): Promise<string | null> {
    console.log("[GocometService] Attempting to generate new token...")
    try {
      const response = await fetch(this.GOCOMET_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.GOCOMET_EMAIL,
          password: this.GOCOMET_PASSWORD,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }))
        console.error(
          `[GocometService] Token generation failed with status ${response.status}:`,
          errorBody.message || response.statusText,
        )
        return null
      }

      const data = await response.json()
      if (data.status === "success" && data.token) {
        tokenCache = {
          token: data.token,
          expiresAt: new Date(data.expires_at).getTime(), // Convert to milliseconds
        }
        console.log(
          "[GocometService] Token generated successfully. Expires at:",
          new Date(tokenCache.expiresAt).toLocaleString(),
        )
        return tokenCache.token
      } else {
        console.error("[GocometService] Token generation response not successful or missing token:", data)
        return null
      }
    } catch (error) {
      console.error("[GocometService] Error during token generation:", error)
      return null
    }
  }

  private async getValidToken(): Promise<string | null> {
    // Regenerate token if it's null, expired, or expires within the next 60 seconds
    if (!tokenCache || tokenCache.expiresAt < Date.now() + 60 * 1000) {
      console.log("[GocometService] Token expired or not found. Generating new token...")
      return this.generateToken()
    }
    console.log("[GocometService] Using cached token.")
    return tokenCache.token
  }

  private transformGocometEvent(gocometEvent: any): TrackingEvent {
    const timestamp =
      gocometEvent.actual_datetime || gocometEvent.actual_date
        ? new Date(gocometEvent.actual_datetime || gocometEvent.actual_date).toISOString()
        : new Date().toISOString() // Fallback to current time if no date provided

    return {
      status: gocometEvent.event || "N/A",
      location: gocometEvent.location || "N/A",
      timestamp: timestamp,
      description: gocometEvent.display_event || gocometEvent.remarks || gocometEvent.event,
      carrierEvent: gocometEvent.carrier_event,
      vesselName: gocometEvent.vessel_details?.vessel_name,
      voyage: gocometEvent.vessel_details?.voyage_num,
      imoNumber: gocometEvent.vessel_details?.imo_number,
      mode: gocometEvent.mode,
      plannedDate: gocometEvent.planned_date,
      actualDate: gocometEvent.actual_date,
    }
  }

  private transformGocometData(gocometTracking: any): TrackingData {
    const events: TrackingEvent[] = (gocometTracking.events || []).map(this.transformGocometEvent.bind(this))

    // Determine estimated arrival from the last 'arrival' event if available
    const lastArrivalEvent = events.find(
      (event) => event.status.toLowerCase().includes("arrival") && event.timestamp !== "N/A",
    )
    const estimatedArrival =
      lastArrivalEvent?.timestamp ||
      gocometTracking.stats?.last_ocean_event?.actual_datetime ||
      gocometTracking.stats?.last_ocean_event?.planned_datetime ||
      null

    return {
      shipmentNumber:
        gocometTracking.tracking_number ||
        gocometTracking.mbl_or_awb_number ||
        gocometTracking.container_number ||
        "N/A",
      status: gocometTracking.status || "N/A",
      containerNumber: gocometTracking.container_number,
      mblOrAwbNumber: gocometTracking.mbl_or_awb_number,
      carrier: gocometTracking.carrier_name || "N/A",
      vesselName: gocometTracking.ais_data?.current_vessel || null,
      voyage: null, // GoComet doesn't provide a direct voyage for the main tracking object
      location: gocometTracking.ais_data?.lat_lon
        ? `${gocometTracking.ais_data.lat_lon[0]}, ${gocometTracking.ais_data.lat_lon[1]}`
        : gocometTracking.pol_name || gocometTracking.pod_name || null,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival).toISOString() : null,
      events: events,
      source: "Gocomet",
      isLiveData: true,
      lastUpdated: gocometTracking.updated_at
        ? new Date(gocometTracking.updated_at).toISOString()
        : new Date().toISOString(),
      polName: gocometTracking.pol_name,
      podName: gocometTracking.pod_name,
      referenceNo: gocometTracking.reference_no,
      containerType: gocometTracking.container_type,
      containerSize: gocometTracking.container_size,
      aisData: gocometTracking.ais_data
        ? {
            currentVessel: gocometTracking.ais_data.current_vessel,
            speed: gocometTracking.ais_data.speed,
            latLon: gocometTracking.ais_data.lat_lon,
            lastUpdated: gocometTracking.ais_data.last_updated,
            imoNumber: gocometTracking.ais_data.imo_number,
          }
        : undefined,
      trackingLink: gocometTracking.tracking_link,
      archived: gocometTracking.archered,
      otherData: gocometTracking.other_data,
      shipmentRemark: gocometTracking.shipment_remark,
    }
  }

  async trackShipment(trackingNumber: string, options?: any): Promise<TrackingResult> {
    if (!this.GOCOMET_EMAIL || !this.GOCOMET_PASSWORD) {
      console.error("[GocometService] GOCOMET_EMAIL or GOCOMET_PASSWORD are not set. Cannot proceed with tracking.")
      return { success: false, error: "Gocomet credentials not configured.", source: "Gocomet" }
    }

    const token = await this.getValidToken()
    if (!token) {
      return {
        success: false,
        error: "Failed to obtain Gocomet API token. Check credentials and network.",
        source: "Gocomet",
      }
    }

    const startDate = "01/01/2023" // Fetch data from a reasonable past date
    const url = new URL(this.GOCOMET_TRACKING_URL)
    url.searchParams.append("token", token)
    url.searchParams.append("start_date", startDate)
    url.searchParams.append("tracking_numbers[]", trackingNumber) // Use tracking_numbers[] for direct lookup

    console.log(`[GocometService] Calling GoComet Live Tracking API for ${trackingNumber}: ${url.toString()}`)
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        console.error(
          `[GocometService] GoComet Live tracking API error for ${trackingNumber} (Status: ${response.status}):`,
          errorBody.message || response.statusText,
        )
        return {
          success: false,
          error: `GoComet API error: ${response.status} - ${errorBody.message || "Unknown error"}`,
          source: "Gocomet",
        }
      }

      const data = await response.json()
      console.log("[GocometService] Raw GoComet Live Tracking Response:", JSON.stringify(data, null, 2))

      if (!data.updated_trackings || data.updated_trackings.length === 0) {
        console.log(`[GocometService] No tracking information found for ${trackingNumber} from GoComet.`)
        return { success: false, error: "No tracking information found from GoComet.", source: "Gocomet" }
      }

      // Find the most relevant tracking entry, e.g., the first one or one matching trackingNumber
      const gocometShipment =
        data.updated_trackings.find(
          (s: any) =>
            s.tracking_number === trackingNumber ||
            s.container_number === trackingNumber ||
            s.mbl_or_awb_number === trackingNumber,
        ) || data.updated_trackings[0] // Fallback to first if no exact match

      if (!gocometShipment) {
        console.log(`[GocometService] No matching tracking information found for ${trackingNumber} after filtering.`)
        return { success: false, error: "No matching tracking information found from GoComet.", source: "Gocomet" }
      }

      return {
        success: true,
        data: this.transformGocometData(gocometShipment),
        source: "Gocomet API",
        isLiveData: true,
        scrapedAt: gocometShipment.updated_at || new Date().toISOString(),
      }
    } catch (error: any) {
      console.error(`[GocometService] Error tracking with Gocomet for ${trackingNumber}:`, error)
      return { success: false, error: error.message || "Failed to track with Gocomet", source: "Gocomet" }
    }
  }
}
