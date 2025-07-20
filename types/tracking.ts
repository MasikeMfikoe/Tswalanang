export interface TrackingEvent {
  status: string // e.g., "In Transit", "Delivered", "Departed"
  location: string // e.g., "Port of Shanghai", "Los Angeles"
  timestamp: string // ISO 8601 format, e.g., "2023-10-26T10:00:00Z"
  description?: string // Detailed description of the event
  carrierEvent?: string // Raw event string from carrier if available
  vesselName?: string
  voyage?: string
  imoNumber?: string
  mode?: string // e.g., "ocean", "air", "road"
  plannedDate?: string // YYYY-MM-DD
  actualDate?: string // YYYY-MM-DD
}

export interface TrackingData {
  shipmentNumber: string
  status: string
  containerNumber?: string
  mblOrAwbNumber?: string // Master Bill of Lading or Air Waybill
  carrier: string
  vesselName?: string
  voyage?: string
  location?: string // Current location of the shipment
  estimatedArrival?: string // ISO 8601 format
  events: TrackingEvent[] // Detailed timeline of events
  source: string // e.g., "SeaRates", "Gocomet", "Web Scraping"
  isLiveData: boolean // True if data is from a live API, false if cached or scraped
  lastUpdated?: string // ISO 8601 format of when this data was last updated
  polName?: string // Port of Loading Name
  podName?: string // Port of Discharge Name
  referenceNo?: string // Customer reference number
  containerType?: string // e.g., "20GP", "40HC"
  containerSize?: string // e.g., "20", "40"
  aisData?: {
    currentVessel?: string
    speed?: number
    latLon?: [number, number] // [latitude, longitude]
    lastUpdated?: string // ISO 8601
    imoNumber?: string
  }
  trackingLink?: string // Direct link to carrier's tracking page
  archived?: boolean
  otherData?: Record<string, any> // Any other relevant data not directly mapped
  shipmentRemark?: string
}

export interface TrackingResult {
  success: boolean
  data?: TrackingData
  error?: string
  source: string
  isLiveData?: boolean
  scrapedAt?: string // Timestamp for scraped data
  fallbackOptions?: string[] // Suggestions for alternative tracking methods
}
