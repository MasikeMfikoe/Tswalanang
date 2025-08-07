export type TrackingEvent = {
  type: "event" | "vessel-arrival" | "vessel-departure" | "gate" | "load" | "cargo-received" | "customs-cleared"
  status: string
  location: string
  timestamp: string // ISO 8601 string, used for internal sorting (actual date preferred, then planned)
  date: string // Formatted actual date
  time: string // Formatted actual time
  description?: string
  vessel?: string
  voyage?: string
  pieces?: number
  volume?: number
  weight?: number
  plannedDate?: string // Added: Formatted planned date for the event
  actualDate?: string // Added: Formatted actual date for the event
}

export type TrackingData = {
  shipmentNumber: string
  status: string
  containerNumber?: string
  containerType?: string
  weight?: string
  origin: string
  destination: string
  pol?: string // Port of Loading
  pod?: string // Port of Discharge
  estimatedArrival?: string // ISO 8601 string or date string
  estimatedDeparture?: string // Added: ISO 8601 string or date string
  lastLocation?: string
  timeline: Array<{
    location: string
    terminal?: string
    events: TrackingEvent[]
  }>
  documents?: Array<{
    type: string
    url: string
    description?: string
  }>
  details?: {
    packages?: string
    specialInstructions?: string
    dimensions?: string
    shipmentType?: string
    pieces?: number
    volume?: number
  }
  demurrageDetentionDays?: number | null // Added: Demurrage & Detention Days, can be null
  raw?: any // Raw data from the API
}

export type TrackingResult =
  | {
      success: true
      data: TrackingData
      source: string
      isLiveData: boolean
      scrapedAt?: string
    }
  | {
      success: false
      error: string
      source: string
      fallbackOptions?: string[]
    }

export type ShipmentType = "ocean" | "air" | "lcl" | "unknown"

export type DetectedShipmentInfo = {
  type: ShipmentType
  carrierHint?: string
}

export type CarrierSuggestion = {
  name: string
  code: string
  type: ShipmentType
}
