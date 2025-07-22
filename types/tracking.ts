export type ShipmentType = "ocean" | "air" | "lcl" | "parcel" | "unknown"

export interface TrackingEvent {
  timestamp: string // ISO string
  date?: string // YYYY-MM-DD
  time?: string // HH:MM
  location?: string
  description?: string
  status?: string // e.g., "In Transit", "Delivered"
  vessel?: string
  flightNumber?: string
  type?:
    | "event"
    | "vessel-departure"
    | "vessel-arrival"
    | "plane-takeoff"
    | "plane-landing"
    | "gate"
    | "load"
    | "cargo-received"
    | "customs-cleared"
    | "pickup" // Added from Road/Courier events
    | "out-for-delivery" // Added from Road/Courier events
  mode?: string // e.g., "Ocean", "Air", "Road"
  voyage?: string // Voyage number for ocean shipments
  originalPlan?: string // Original planned date/time
  currentPlan?: string // Current planned date/time
  terminal?: string // Specific terminal at a location
}

export interface TrackingData {
  shipmentNumber: string
  status: string
  carrier?: string
  containerNumber?: string
  containerType?: string
  weight?: string
  origin?: string
  destination?: string
  pol?: string // Port of Loading
  pod?: string // Port of Discharge
  eta?: string // Estimated Time of Arrival (derived from events)
  etd?: string // Estimated Time of Departure (derived from events)
  lastLocation?: string
  timeline: Array<{
    location: string
    terminal?: string
    events: TrackingEvent[]
  }>
  documents?: Array<{
    type?: string
    url: string
    description?: string
  }>
  details?: {
    packages?: string
    dimensions?: string
    specialInstructions?: string
    shipmentType?: ShipmentType
    freeDaysBeforeDemurrage?: number
  }
}

export interface TrackingResult {
  success: boolean
  data?: TrackingData
  error?: string
  source: string // e.g., "GoComet API", "SeaRates API", "MockProvider", "fallback"
  isLiveData: boolean
  fallbackOptions?: {
    carrier: string
    trackingUrl: string
  }
}

export type GoCometAuthResponse = {
  token: string
  expires_in: number
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

export type CarrierDetectionResult = {
  carrier: "MSC" | "Maersk" | "GoComet" | "Trackship" | "Unknown"
  type: "container" | "airwaybill" | "unknown"
  isValid: boolean
  carrierHint?: string
}
