export interface TrackingEvent {
  status: string
  location: string
  timestamp: string
  description?: string
  // Add any other relevant fields from SeaRates API response
}

export interface TrackingData {
  shipmentNumber: string
  containerNumber?: string
  status: string
  location: string
  estimatedArrival?: string
  carrier?: string
  vesselName?: string
  voyage?: string
  events: TrackingEvent[]
  raw?: any // Raw API response for debugging
}

export interface TrackingResult {
  success: boolean
  data?: TrackingData
  error?: string
  source: string // e.g., "TrackShip", "SeaRates", "DirectCarrierAPIs"
  isLiveData?: boolean
  scrapedAt?: string
  fallbackOptions?: { name: string; url: string }[]
}
