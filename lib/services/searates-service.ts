import type { TrackingResult, TrackingData } from "@/types/tracking"

export class SeaRatesService {
  private API_KEY = process.env.SEARATES_API_KEY || "YOUR_SEARATES_API_KEY" // Fallback for local dev
  private BASE_URL = "https://api.searates.com/tracking/v2"

  constructor() {
    if (!process.env.SEARATES_API_KEY) {
      console.warn("SEARATES_API_KEY environment variable is not set. Using a placeholder key.")
    }
  }

  async trackShipment(
    trackingNumber: string,
    options?: {
      forceUpdate?: boolean
      includeRoute?: boolean
      includeAis?: boolean
      sealine?: string // Carrier hint for SeaRates
      type?: "CT" | "BL" | "AWB" // Container, Bill of Lading, Air Waybill
    },
  ): Promise<TrackingResult> {
    if (!this.API_KEY || this.API_KEY === "YOUR_SEARATES_API_KEY") {
      return { success: false, error: "SeaRates API key not configured.", source: "SeaRates" }
    }

    const params = new URLSearchParams({
      api_key: this.API_KEY,
      number: trackingNumber,
    })

    if (options?.forceUpdate) {
      params.append("force_update", "true")
    }
    if (options?.includeRoute) {
      params.append("include_route", "true")
    }
    if (options?.includeAis) {
      params.append("include_ais", "true")
    }
    if (options?.sealine) {
      params.append("sealine", options.sealine)
    }
    if (options?.type) {
      params.append("type", options.type)
    }

    const url = `${this.BASE_URL}?${params.toString()}`
    console.log(`[SeaRatesService] Calling SeaRates API: ${url}`)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[SeaRatesService] API error:", errorData)
        return {
          success: false,
          error: `SeaRates API error: ${response.status} - ${errorData.message || "Unknown error"}`,
          source: "SeaRates",
        }
      }

      const data = await response.json()
      console.log("[SeaRatesService] Raw SeaRates Response:", JSON.stringify(data, null, 2))

      if (!data.tracking || data.tracking.length === 0) {
        return { success: false, error: "No tracking information found from SeaRates.", source: "SeaRates" }
      }

      const seaRatesTracking = data.tracking[0] // Assuming the first tracking object is the most relevant

      // Transform SeaRates response to your TrackingResult format
      const transformedData: TrackingData = {
        shipmentNumber: seaRatesTracking.number || trackingNumber,
        status: seaRatesTracking.status || "Unknown",
        containerNumber: seaRatesTracking.container_number,
        mblOrAwbNumber: seaRatesTracking.bl_number || seaRatesTracking.awb_number,
        carrier: seaRatesTracking.sealine || "Unknown",
        vesselName: seaRatesTracking.vessel_name,
        voyage: seaRatesTracking.voyage,
        location: seaRatesTracking.current_location?.name || "Unknown",
        estimatedArrival: seaRatesTracking.eta ? new Date(seaRatesTracking.eta).toISOString() : null,
        events: (seaRatesTracking.events || []).map((event: any) => ({
          status: event.status || "Unknown",
          location: event.location?.name || "Unknown",
          timestamp: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
          description: event.description,
          vesselName: event.vessel_name,
          voyage: event.voyage,
          mode: seaRatesTracking.type === "CT" ? "ocean" : seaRatesTracking.type === "AWB" ? "air" : undefined,
        })),
        source: "SeaRates API",
        isLiveData: true,
        lastUpdated: seaRatesTracking.updated_at
          ? new Date(seaRatesTracking.updated_at).toISOString()
          : new Date().toISOString(),
        polName: seaRatesTracking.pol?.name,
        podName: seaRatesTracking.pod?.name,
        referenceNo: seaRatesTracking.reference_number,
        containerType: seaRatesTracking.container_type,
        containerSize: seaRatesTracking.container_size,
        aisData: seaRatesTracking.ais_data
          ? {
              currentVessel: seaRatesTracking.ais_data.vessel_name,
              speed: seaRatesTracking.ais_data.speed,
              latLon: seaRatesTracking.ais_data.lat_lon,
              lastUpdated: seaRatesTracking.ais_data.last_updated,
              imoNumber: seaRatesTracking.ais_data.imo_number,
            }
          : undefined,
        trackingLink: seaRatesTracking.tracking_link,
        otherData: {
          packages: seaRatesTracking.packages,
          weight: seaRatesTracking.weight,
          volume: seaRatesTracking.volume,
        },
      }

      return {
        success: true,
        data: transformedData,
        source: "SeaRates API",
        isLiveData: true,
        scrapedAt: transformedData.lastUpdated,
      }
    } catch (error: any) {
      console.error("[SeaRatesService] Error tracking with SeaRates:", error)
      return { success: false, error: error.message || "Failed to track with SeaRates", source: "SeaRates" }
    }
  }
}
