export type OrderStatus =
  | "Pending"
  | "Processing"
  | "In Transit"
  | "Customs Clearance"
  | "Delivered"
  | "Completed"
  | "Cancelled"
  | "On Hold"
  | "Exception"

export type DocumentType =
  | "Bill of Lading"
  | "Commercial Invoice"
  | "Packing List"
  | "Certificate of Origin"
  | "Customs Declaration"
  | "Proof of Delivery"
  | "Other"

export type FreightType = "Air" | "Ocean" | "Road" | "Rail" | "Multimodal"

export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface Customer {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  vat_number?: string
  importers_code?: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer_name: string // Denormalized for easier access
  po_number: string
  order_date: string
  status: OrderStatus
  freight_type: FreightType
  origin_address: Address
  destination_address: Address
  total_value: number
  currency: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  documents?: Document[] // Joined documents
}

export interface Document {
  id: string
  order_id: string
  file_name: string
  file_url: string
  document_type: DocumentType
  uploaded_at: string
  uploaded_by: string // User ID or Name
  status: "Pending" | "Approved" | "Rejected"
  notes?: string
}

export interface Shipment {
  id: string
  order_id: string
  tracking_number: string
  carrier: string
  current_status: string
  last_updated: string
  origin_port?: string
  destination_port?: string
  vessel_name?: string
  eta?: string
  actual_arrival?: string
  container_number?: string
  created_at: string
  updated_at: string
}

export interface CargoStatus {
  id: string
  shipment_id: string
  timestamp: string
  location: string
  status_code: string
  status_description: string
  notes?: string
  created_at: string
}

export interface CourierOrder {
  id: string
  order_id?: string // Link to main order if applicable
  customer_id: string
  customer_name: string
  pickup_address: Address
  delivery_address: Address
  package_description: string
  weight: number
  dimensions: { length: number; width: number; height: number }
  status: "Pending" | "Scheduled" | "In Transit" | "Delivered" | "Cancelled"
  tracking_number?: string
  courier_company: string
  pickup_date: string
  delivery_date?: string
  price: number
  currency: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Estimate {
  id: string
  customer_id: string
  customer_name: string
  estimate_number: string
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Converted to Order"
  freight_type: FreightType
  origin_address: Address
  destination_address: Address
  items: EstimateItem[]
  total_estimated_cost: number
  currency: string
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface EstimateItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface RateItem {
  id: string
  customer_id: string
  freight_type: FreightType
  origin_country: string
  destination_country: string
  unit_type: "per_kg" | "per_cbm" | "per_container" | "flat_rate"
  rate: number
  currency: string
  valid_from: string
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data?: T
  success: boolean
  message?: string
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T
  total: number
  page: number
  pageSize: number
  totalPages: number
}
