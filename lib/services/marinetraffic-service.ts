export interface MarineTrafficCredentials {
  apiKey: string
  baseUrl: string
}

export interface VesselPosition {
  mmsi: number
  imo: number
  ship_name: string
  callsign: string
  ship_type: number
  latitude: number
  longitude: number
  speed: number
  course: number
  timestamp: string
  destination: string
  eta: string
  draught: number
  length: number
  width: number
}

export interface PortCall {
  port_name: string
  port_id: number
  country_code: string
  arrival_time: string
  departure_time: string
  status: string
  berth: string
  terminal: string
}

export interface VesselTrackingData {
  vessel: {
    mmsi: number
    imo: number
    name: string
    callsign: string
    type: string
    flag: string
    built: number
    length: number
    width: number
    dwt: number
    gt: number
  }
  position: {
    latitude: number
    longitude: number
    speed: number
    course: number
    heading: number
    timestamp: string
    status: string
  }
  voyage: {
    destination: string
    eta: string
    draught: number
    max_draught: number
  }
  port_calls: PortCall[]
}

export interface MarineTrafficResponse {
  success: boolean
  data?: any
  vessels?: VesselPosition[]
  port_calls?: PortCall[]
  error?: string
  message?: string
}

import { UnifiedTrackingService } from "./unified-tracking-service"

export class MarineTrafficService {
  private apiKey: string
  private unifiedTrackingService: UnifiedTrackingService

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.unifiedTrackingService = new UnifiedTrackingService()
  }

  async trackVesselByIMO(imo: string): Promise<MarineTrafficResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "MarineTraffic API key not configured",
        }
      }

      const baseUrl = "https://services.marinetraffic.com/api/exportvessel"
      const endpoint = `${baseUrl}/v:8/${this.apiKey}/imo:${imo}/protocol:jsono`

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "User-Agent": "TSW-SmartLog/1.0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `MarineTraffic API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        return {
          success: false,
          error: "Vessel not found",
          message: "No vessel data available for the provided IMO number",
        }
      }

      const vesselData = Array.isArray(data) ? data[0] : data

      return {
        success: true,
        data: this.transformVesselData(vesselData),
      }
    } catch (error) {
      console.error("MarineTraffic service error:", error)
      return {
        success: false,
        error: "Failed to connect to MarineTraffic service",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async trackVesselByName(vesselName: string): Promise<MarineTrafficResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "MarineTraffic API key not configured",
        }
      }

      const baseUrl = "https://services.marinetraffic.com/api/exportvessel"
      const endpoint = `${baseUrl}/v:8/${this.apiKey}/shipname:${encodeURIComponent(vesselName)}/protocol:jsono`

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "User-Agent": "TSW-SmartLog/1.0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `MarineTraffic API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        return {
          success: false,
          error: "Vessel not found",
          message: "No vessel data available for the provided vessel name",
        }
      }

      const vesselData = Array.isArray(data) ? data[0] : data

      return {
        success: true,
        data: this.transformVesselData(vesselData),
      }
    } catch (error) {
      console.error("MarineTraffic service error:", error)
      return {
        success: false,
        error: "Failed to connect to MarineTraffic service",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getVesselPortCalls(imo: string, days = 30): Promise<MarineTrafficResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "MarineTraffic API key not configured",
        }
      }

      const baseUrl = "https://services.marinetraffic.com/api/portcalls"
      const endpoint = `${baseUrl}/v:6/${this.apiKey}/imo:${imo}/days:${days}/protocol:jsono`

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "User-Agent": "TSW-SmartLog/1.0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `MarineTraffic API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      return {
        success: true,
        port_calls: Array.isArray(data) ? data.map(this.transformPortCallData) : [],
      }
    } catch (error) {
      console.error("MarineTraffic port calls error:", error)
      return {
        success: false,
        error: "Failed to get port calls data",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getVesselsInPort(portId: number): Promise<MarineTrafficResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "MarineTraffic API key not configured",
        }
      }

      const baseUrl = "https://services.marinetraffic.com/api/portcalls"
      const endpoint = `${baseUrl}/v:6/${this.apiKey}/portid:${portId}/protocol:jsono`

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "User-Agent": "TSW-SmartLog/1.0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `MarineTraffic API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      return {
        success: true,
        vessels: Array.isArray(data) ? data.map(this.transformVesselPosition) : [],
      }
    } catch (error) {
      console.error("MarineTraffic vessels in port error:", error)
      return {
        success: false,
        error: "Failed to get vessels in port data",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async searchVesselsByArea(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
  ): Promise<MarineTrafficResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "MarineTraffic API key not configured",
        }
      }

      const baseUrl = "https://services.marinetraffic.com/api/exportvessels"
      const endpoint = `${baseUrl}/v:8/${this.apiKey}/minlat:${minLat}/maxlat:${maxLat}/minlon:${minLon}/maxlon:${maxLon}/protocol:jsono`

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "User-Agent": "TSW-SmartLog/1.0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `MarineTraffic API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      return {
        success: true,
        vessels: Array.isArray(data) ? data.map(this.transformVesselPosition) : [],
      }
    } catch (error) {
      console.error("MarineTraffic area search error:", error)
      return {
        success: false,
        error: "Failed to search vessels in area",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getVesselPosition(imo: string) {
    const baseUrl = "https://services.marinetraffic.com/api/exportvessel"
    const endpoint = `${baseUrl}/v:8/${this.apiKey}/imo:${imo}/protocol:jsono`

    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (data && data.length > 0) {
        const vesselData = data[0]
        return {
          success: true,
          data: {
            shipName: vesselData.SHIPNAME,
            latitude: vesselData.LAT,
            longitude: vesselData.LON,
            speed: vesselData.SPEED,
            heading: vesselData.HEADING,
            timestamp: vesselData.TIMESTAMP,
          },
        }
      } else {
        return { success: false, error: "No data found for this IMO." }
      }
    } catch (error: any) {
      console.error("Error fetching vessel position:", error)
      return { success: false, error: error.message }
    }
  }

  async trackShipment(trackingNumber: string) {
    return this.unifiedTrackingService.trackShipment(trackingNumber)
  }

  private transformVesselData(data: any): VesselTrackingData {
    return {
      vessel: {
        mmsi: data.MMSI || 0,
        imo: data.IMO || 0,
        name: data.SHIPNAME || "Unknown",
        callsign: data.CALLSIGN || "",
        type: this.getShipTypeName(data.SHIPTYPE || 0),
        flag: data.FLAG || "",
        built: data.YEAR_BUILT || 0,
        length: data.LENGTH || 0,
        width: data.WIDTH || 0,
        dwt: data.DWT || 0,
        gt: data.GT || 0,
      },
      position: {
        latitude: data.LAT || 0,
        longitude: data.LON || 0,
        speed: data.SPEED || 0,
        course: data.COURSE || 0,
        heading: data.HEADING || 0,
        timestamp: data.TIMESTAMP || new Date().toISOString(),
        status: this.getNavigationStatus(data.STATUS || 0),
      },
      voyage: {
        destination: data.DESTINATION || "",
        eta: data.ETA || "",
        draught: data.CURRENT_DRAUGHT || 0,
        max_draught: data.MAX_DRAUGHT || 0,
      },
      port_calls: [], // Will be populated separately if needed
    }
  }

  private transformVesselPosition(data: any): VesselPosition {
    return {
      mmsi: data.MMSI || 0,
      imo: data.IMO || 0,
      ship_name: data.SHIPNAME || "Unknown",
      callsign: data.CALLSIGN || "",
      ship_type: data.SHIPTYPE || 0,
      latitude: data.LAT || 0,
      longitude: data.LON || 0,
      speed: data.SPEED || 0,
      course: data.COURSE || 0,
      timestamp: data.TIMESTAMP || new Date().toISOString(),
      destination: data.DESTINATION || "",
      eta: data.ETA || "",
      draught: data.CURRENT_DRAUGHT || 0,
      length: data.LENGTH || 0,
      width: data.WIDTH || 0,
    }
  }

  private transformPortCallData(data: any): PortCall {
    return {
      port_name: data.PORT_NAME || "Unknown",
      port_id: data.PORT_ID || 0,
      country_code: data.COUNTRY_CODE || "",
      arrival_time: data.ARRIVAL_TIME || "",
      departure_time: data.DEPARTURE_TIME || "",
      status: data.STATUS || "",
      berth: data.BERTH || "",
      terminal: data.TERMINAL || "",
    }
  }

  private getShipTypeName(shipType: number): string {
    const shipTypes: Record<number, string> = {
      70: "Cargo Ship",
      71: "Cargo Ship - Hazardous Category A",
      72: "Cargo Ship - Hazardous Category B",
      73: "Cargo Ship - Hazardous Category C",
      74: "Cargo Ship - Hazardous Category D",
      80: "Tanker",
      81: "Tanker - Hazardous Category A",
      82: "Tanker - Hazardous Category B",
      83: "Tanker - Hazardous Category C",
      84: "Tanker - Hazardous Category D",
      1001: "Fishing",
      1002: "Towing",
      1003: "Towing Long/Wide",
      1004: "Dredging",
      1005: "Diving",
      1006: "Military",
      1007: "Sailing",
      1008: "Pleasure",
      1009: "High Speed Craft",
      1010: "Pilot",
      1011: "Search and Rescue",
      1012: "Tug",
      1013: "Port Tender",
      1014: "Anti-Pollution",
      1015: "Law Enforcement",
      1016: "Medical",
      1017: "RR Resolution No.18",
      1018: "Passenger",
      1019: "Cargo",
      1020: "Tanker",
      1021: "Other",
    }

    return shipTypes[shipType] || `Unknown (${shipType})`
  }

  private getNavigationStatus(status: number): string {
    const statuses: Record<number, string> = {
      0: "Under way using engine",
      1: "At anchor",
      2: "Not under command",
      3: "Restricted manoeuvrability",
      4: "Constrained by her draught",
      5: "Moored",
      6: "Aground",
      7: "Engaged in fishing",
      8: "Under way sailing",
      9: "Reserved for future amendment",
      10: "Reserved for future amendment",
      11: "Power-driven vessel towing astern",
      12: "Power-driven vessel pushing ahead",
      13: "Reserved for future use",
      14: "AIS-SART",
      15: "Undefined",
    }

    return statuses[status] || `Unknown (${status})`
  }

  // Helper method to extract vessel information from container tracking
  extractVesselFromTrackingData(trackingData: any): { vesselName?: string; imo?: string; voyage?: string } {
    const result: { vesselName?: string; imo?: string; voyage?: string } = {}

    // Look for vessel information in timeline events
    if (trackingData.timeline) {
      for (const locationGroup of trackingData.timeline) {
        for (const event of locationGroup.events || []) {
          if (event.vessel) {
            // Extract vessel name and voyage from strings like "EXPRESS ARGENTINA / 514S"
            const vesselMatch = event.vessel.match(/^([^/]+)(?:\s*\/\s*(.+))?$/)
            if (vesselMatch) {
              result.vesselName = vesselMatch[1].trim()
              result.voyage = vesselMatch[2]?.trim()
            }
          }
        }
      }
    }

    return result
  }
}
