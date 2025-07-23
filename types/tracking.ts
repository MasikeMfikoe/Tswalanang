export type ShipmentType = "ocean" | "air" | "parcel" | "lcl" | "unknown"

export interface TrackingEvent {
  timestamp: string // ISO string
  location?: string
  status: string
  description?: string
  type?:
    | "cargo-received"
    | "load"
    | "vessel-departure"
    | "vessel-arrival"
    | "plane-takeoff"
    | "plane-landing"
    | "customs-cleared"
    | "delivery"
    | "event"
  vessel?: string
  voyage?: string
  flightNumber?: string
  mode?: string // e.g., "truck", "rail", "ocean", "air"
  date?: string // Formatted date string if available
  time?: string // Formatted time string if available
  terminal?: string // Terminal name if available
}

export interface TrackingTimelineLocation {
  location: string
  terminal?: string
  events: TrackingEvent[]
}

export interface TrackingDetails {
  shipmentType?: ShipmentType
  containerType?: string
  freeDaysBeforeDemurrage?: number
  // Add other specific details as needed
}

export interface TrackingData {
  shipmentNumber: string
  status: string
  containerNumber?: string
  origin?: string
  destination?: string
  pol?: string // Port of Loading
  pod?: string // Port of Discharge
  eta?: string // Estimated Time of Arrival
  etd?: string // Estimated Time of Departure
  carrier?: string
  events?: TrackingEvent[]
  timeline?: TrackingTimelineLocation[] // Structured timeline
  documents?: { type: string; url: string; description?: string }[]
  weight?: string
  lastLocation?: string
  details?: TrackingDetails
}

export interface TrackingResult {
  success: boolean
  data?: TrackingData
  error?: string
  source?: string // e.g., "trackship", "maersk-api", "gocomet", "mock"
  isLiveData?: boolean // True if data is from a live API, false if mocked or fallback
  fallbackOptions?: {
    carrier: string
    trackingUrl: string
  }
}

export interface CarrierDetectionResult {
  carrier: string
  type: ShipmentType
  isValid: boolean
  carrierHint?: string // A more specific hint like "MAEU" for Maersk containers
}

export interface CarrierSuggestion {
  name: string
  code: string
  type: ShipmentType
}

// Type for a single tracking item returned by the GET /live-tracking API
export interface GoCometLiveTrackingItem {
  tracking_id: string
  container_number?: string
  carrier_name: string
  carrier_code: string
  consignee: string | null
  mbl_or_awb_number: string
  tracking_number: string // This is the main tracking number (e.g., BL, AWB, Container)
  pol_name?: string
  pod_name?: string
  reference_no?: string
  status: string // e.g., "Active", "Completed", "Delayed"
  updated_at: string // ISO string
  container_type?: string
  container_size?: string
  events: Array<{
    event_id: string
    event: string // e.g., "empty_pickup", "gate_in", "origin_departure", "arrival", "delivered"
    location: string
    actual_date: string // DD/MM/YYYY
    planned_date: string // DD/MM/YYYY
    original_planned_date: string // DD/MM/YYYY
    actual_datetime?: string // DD/MM/YYYY HH:MM:SS
    planned_datetime?: string // DD/MM/YYYY HH:MM:SS
    original_planned_datetime?: string // DD/MM/YYYY HH:MM:SS
    discharge_or_loading_date?: string
    mode: string // e.g., "TRUCK", "OCEAN", "AIR"
    remarks?: string
    delayed: boolean
    display_event: string // User-friendly event name
    vessel_details?: {
      vessel_num?: string
      voyage_num?: string
      vessel_name?: string
      imo_number?: number
    }
    connected_port?: string
    geofence_date?: string
  }>
  stats: {
    last_ocean_event: any // Can be detailed if needed
    departure_event_of_last_ocean_event: any // Can be detailed if needed
    demurrage: {
      days_left: number | null
      days_passed: number | null
      cost_incurred_in_usd: number | null
    }
    detention: {
      days_left: number | null
      days_passed: number | null
      cost_incurred_in_usd: number | null
    }
    best_case_eta?: string // From Air/Road stats
    predicted_eta?: string // From Air/Road stats
  }
  ais_data?: {
    // Only for Ocean
    current_vessel?: string
    speed?: string
    lat_lon?: [number, number]
    last_updated?: string // ISO string
    imo_number?: number
  }
  tracking_link?: string
  archived: boolean
  other_data?: Record<string, string>
  shipment_remark?: string | null
}

// Type for the overall response from the GET /live-tracking API
export type GoCometLiveTrackingResponse = {
  updated_trackings: GoCometLiveTrackingItem[]
}

export type GoCometAuthResponse = {
  token: string
  expires_in: number
}
