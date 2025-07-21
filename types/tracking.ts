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
  eta?: string // Estimated Time of Arrival
  etd?: string // Estimated Time of Departure
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
    freeDaysBeforeDemurrage?: number // Added this field
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
