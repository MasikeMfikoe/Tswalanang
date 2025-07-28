// Shipping line types
export type ShippingLine = "maersk" | "msc" | "cma-cgm" | "hapag-lloyd" | "one" | "evergreen" | "cosco" | "other"

export interface ContainerStatus {
  containerNumber: string
  status: string
  location: string
  timestamp: string
  vessel?: string
  voyage?: string
  eta?: string
  details?: string
  raw?: any // Raw API response for debugging
}

export interface ShipmentUpdate {
  id: string
  shipmentId: string
  containerNumber: string
  bookingReference?: string
  shippingLine: ShippingLine
  status: string
  previousStatus?: string
  location: string
  timestamp: string
  eta?: string
  vessel?: string
  voyage?: string
  details?: string
  source: "api" | "webhook" | "manual"
  raw?: string // JSON stringified raw data
  createdAt: string
}

export interface ShippingLineCredentials {
  apiKey?: string
  username?: string
  password?: string
  clientId?: string
  clientSecret?: string
  baseUrl: string
}

// Configuration for shipping line update frequency
export interface UpdateConfig {
  shippingLine: ShippingLine
  intervalMinutes: number // How often to check for updates
  priority: number // 1-5, with 1 being highest priority
  enabled: boolean
}
