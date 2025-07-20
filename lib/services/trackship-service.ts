import type { TrackingResult, TrackingData } from "@/types/tracking"

export class TrackShipService {
  private API_URL = process.env.TRACKSHIP_API_URL || "https://api.trackship.com/v2/track" // Placeholder
  private API_KEY = process.env.TRACKSHIP_API_KEY || "YOUR_TRACKSHIP_API_KEY" // Placeholder

  constructor() {
    if (!process.env.TRACKSHIP_API_KEY) {
      console.warn("TRACKSHIP_API_KEY environment variable is not set. Using a placeholder key.")
    }
    if (!process.env.TRACKSHIP_API_URL) {
      console.warn("TRACKSHIP_API_URL environment variable is not set. Using a placeholder URL.")
    }
  }

  async trackShipment(trackingNumber: string, carrierHint?: string): Promise<TrackingResult> {
    if (!this.API_KEY || this.API_KEY === "YOUR_TRACKSHIP_API_KEY") {
      return { success: false, error: "TrackShip API key not configured.", source: "TrackShip" }
    }
    if (!this.API_URL || this.API_URL === "https://api.trackship.com/v2/track") {
      return { success: false, error: "TrackShip API URL not configured.", source: "TrackShip" }
    }

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.API_KEY,
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          carrier: carrierHint, // Pass carrier hint if available
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[TrackShipService] API error:", errorData)
        return {
          success: false,
          error: `TrackShip API error: ${response.status} - ${errorData.message || "Unknown error"}`,
          source: "TrackShip",
        }
      }

      const data = await response.json()
      console.log("[TrackShipService] Raw TrackShip Response:", JSON.stringify(data, null, 2))

      if (!data.shipment || !data.shipment.tracking_events || data.shipment.tracking_events.length === 0) {
        return { success: false, error: "No tracking information found from TrackShip.", source: "TrackShip" }
      }

      const trackShipment = data.shipment

      // Transform TrackShip response to your TrackingResult format
      const transformedData: TrackingData = {
        shipmentNumber: trackShipment.tracking_number || trackingNumber,
        status: trackShipment.status || "Unknown",
        containerNumber: trackShipment.container_number,
        mblOrAwbNumber: trackShipment.master_bill_of_lading || trackShipment.air_waybill_number,
        carrier: trackShipment.carrier_name || "Unknown",
        vesselName: trackShipment.vessel_name,
        voyage: trackShipment.voyage_number,
        location: trackShipment.current_location?.description || "Unknown",
        estimatedArrival: trackShipment.eta ? new Date(trackShipment.eta).toISOString() : null,
        events: (trackShipment.tracking_events || []).map((event: any) => ({
          status: event.status || "Unknown",
          location: event.location?.description || "Unknown",
          timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
          description: event.description,
          vesselName: event.vessel_name,
          voyage: event.voyage_number,
          mode: trackShipment.shipment_type, // Assuming TrackShip provides this
        })),
        source: "TrackShip API",
        isLiveData: true,
        lastUpdated: trackShipment.last_updated
          ? new Date(trackShipment.last_updated).toISOString()
          : new Date().toISOString(),
        polName: trackShipment.origin_port?.name,
        podName: trackShipment.destination_port?.name,
        referenceNo: trackShipment.reference_number,
        containerType: trackShipment.container_type,
        containerSize: trackShipment.container_size,
        aisData: trackShipment.ais_data
          ? {
              currentVessel: trackShipment.ais_data.vessel_name,
              speed: trackShipment.ais_data.speed,
              latLon: trackShipment.ais_data.lat_lon,
              lastUpdated: trackShipment.ais_data.last_updated,
              imoNumber: trackShipment.ais_data.imo_number,
            }
          : undefined,
        trackingLink: trackShipment.tracking_url,
        otherData: trackShipment.additional_data, // Generic field for other data
      }

      return {
        success: true,
        data: transformedData,
        source: "TrackShip API",
        isLiveData: true,
        scrapedAt: transformedData.lastUpdated,
      }
    } catch (error: any) {
      console.error("[TrackShipService] Error tracking with TrackShip:", error)
      return { success: false, error: error.message || "Failed to track with TrackShip", source: "TrackShip" }
    }
  }
}
