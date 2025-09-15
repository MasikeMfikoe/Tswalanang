// Common types
export type Status = "Pending" | "In Progress" | "Completed" | "Cancelled"
export type CargoStatus =
  | "instruction-sent"
  | "agent-response"
  | "at-origin"
  | "cargo-departed"
  | "in-transit"
  | "at-destination"
  | "delivered"
export type FreightTypeType = "Air Freight" | "Sea Freight" | "EXW" | "FOB"
export type Priority = "High" | "Medium" | "Low"
export type ServiceType = "Express" | "Standard" | "Economy" | "Next Day"
export type EstimateStatus = "Draft" | "Sent" | "Accepted" | "Rejected"

// Order model
export interface Order {
  id: string
  po_number: string
  supplier: string
  importer: string // This might be the customer's name
  status: string
  created_at: string
  updated_at: string
  customer_name: string // Redundant but used for filtering in client portal API
  customer_id: string // Foreign key to customers table
  total_cost: number
  currency: string
  estimated_delivery: string | null
  actual_delivery: string | null
  tracking_number: string | null
  shipping_line: string | null
  origin_port: string | null
  destination_port: string | null
  vessel_name: string | null
  container_number: string | null
  cargo_status: string | null
  last_event_date: string | null
  last_event_description: string | null
  documents: Document[] // Changed to Document[]
  freight_type: string | null // Added missing property
  etd: string | null // Estimated Time of Departure
  eta: string | null // Estimated Time of Arrival
  // Financial columns
  base_freight_cost?: number
  fuel_surcharge?: number
  customs_duties?: number
  insurance_cost?: number
  other_charges?: number
  discount_amount?: number
  tax_amount?: number
  total_billed_amount?: number
  profit_margin?: number
  payment_status?: string
  invoice_number?: string
  invoice_date?: string
  payment_due_date?: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  orderId: string
}

// Customer model
export interface Customer {
  id: string
  name: string
  primary_contact?: string
  secondary_contact?: string
  email: string | null // Used for domain matching
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  total_orders?: number // This is the column you mentioned showing zero
  createdAt?: string
  updatedAt?: string
  rate_card_id?: string
  rateCard?: RateCard
}

export interface RateCard {
  id: string
  customer_id: string
  origin: string
  destination: string
  freight_type: string
  rate_per_unit: number
  currency: string
  valid_from: string
  valid_to: string
  created_at: string
  updated_at: string
  rates?: Rate[]
}

export interface Rate {
  id: string
  rate_card_id: string
  freight_type: string // e.g., 'Air', 'Sea', 'Road'
  service_type: string // e.g., 'Express', 'Standard', 'LCL', 'FCL'
  origin_country?: string
  destination_country?: string
  origin_port?: string
  destination_port?: string
  unit_type: "per_kg" | "per_cbm" | "flat_rate" | "per_container"
  unit_price: number
  min_charge?: number
  currency: string
  notes?: string
}

export interface RateItem {
  id: string
  rate_card_id: string
  freight_type: string
  service_type: string
  origin_country?: string
  destination_country?: string
  origin_port?: string
  destination_port?: string
  unit_type: "per_kg" | "per_cbm" | "flat_rate" | "per_container"
  unit_price: number
  min_charge?: number
  currency: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
}

export interface Contact {
  name: string
  landline: string
  cellphone: string
  email: string
}

// Estimate model
export interface Estimate {
  id: string
  display_id: string // A human-readable ID for estimates
  customer_id: string
  customer_name: string
  origin: string
  destination: string
  freight_type: string
  weight_kg?: number
  volume_cbm?: number
  status: "pending" | "approved" | "rejected"
  estimated_cost: number
  currency: string
  valid_until: string
  createdAt: string
  updatedAt?: string
}

// Document model
export interface Document {
  id: string
  order_id: string
  file_name: string
  file_type: string
  file_url: string
  uploaded_at: string
  document_type: string // e.g., 'POD', 'Invoice', 'Customs Declaration'
}

// Delivery model
export interface Delivery {
  id: string
  orderNumber: string
  status: string
  estimatedDelivery: string
  actualDelivery?: string
  driverName: string
  deliveryCompany: string
  poNumber: string
  createdAt?: string
  updatedAt?: string
}

// Courier Order model
export interface CourierOrder {
  id: string
  waybillNo: string
  poNumber: string
  createdAt: string
  sender: string
  receiver: string
  fromLocation: string
  toLocation: string
  status: string
  serviceType: ServiceType
  items?: CourierOrderItem[]
  trackingEvents?: TrackingEvent[]
  specialInstructions?: string
  accountDetails?: AccountDetails
  contactDetails?: {
    sender: any // ContactDetails
    receiver: any // ContactDetails
  }
  insurance?: string
  totalWeight?: string
  totalVolume?: string
  estimatedDelivery?: string
  actualDelivery?: string
  cost?: OrderCost

  // New fields for electronic delivery receipt
  enableElectronicDeliveryReceipt?: boolean
  notifyRecipient?: boolean
  sendConfirmationToAdmin?: boolean
  recipientEmail?: string
  notificationSentAt?: string

  // New fields for sender notifications
  senderEmail?: string
  notifySenderOnCreate?: boolean
  notifySenderOnConfirm?: boolean
  senderNotificationSentAt?: string
  senderConfirmationSentAt?: string

  // Notification history
  notifications?: NotificationRecord[]
}

// New interface for notification records
export interface NotificationRecord {
  id: number
  type: "recipient" | "sender_created" | "sender_confirmed" | "admin"
  email: string
  status: "sent" | "failed"
  sentAt: string
  retries?: number
}

export interface CourierOrderItem {
  id: number
  description: string
  dimensions: string
  volKgs: number
  massKgs: number
}

export interface TrackingEvent {
  id: number
  status: string
  location: string
  timestamp: string
  notes?: string
}

export interface AccountDetails {
  accountNumber: string
  accountType: string
  creditLimit: string
  paymentTerms: string
}

export interface OrderCost {
  baseCharge: string
  fuelSurcharge: string
  insurance: string
  tax: string
  total: string
}

// Cargo Status History
export interface CargoStatusHistoryEntry {
  id: string
  status: CargoStatus
  comment: string
  timestamp: string
  user: {
    name: string
    surname: string
  }
}

// Shipment
export interface Shipment {
  id: string
  tracking_number: string
  shipping_line: string
  container_number?: string
  vessel_name?: string
  origin_port?: string
  destination_port?: string
  estimated_departure?: string
  estimated_arrival?: string
  actual_departure?: string
  actual_arrival?: string
  status: string
  last_updated: string
  customer_id?: string // Link to customer if applicable
  order_id?: string // Link to order if applicable
  cargo_status_history?: CargoStatusHistory[]
}

export interface CargoStatusHistory {
  id: string
  shipment_id: string
  event_date: string
  location: string
  description: string
  status_code?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Dashboard metrics
export interface DashboardMetrics {
  totalOrders: number
  totalRevenue: number
  completionRate: number
  activeCustomers: number
  ordersByStatus: {
    active: number
    completed: number
    pending: number
  }
  recentOrders: Order[]
  topCustomers: Customer[]
  monthlyOrderTrend: Array<{ name: string; value: number }>
}

// User Profile
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  customer_id?: string // For client users
  role: string
  department: string | null
}

// ApiKey model
export interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  expires_at?: string
  is_active: boolean
}

// FreightType model
export interface FreightType {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Declare ContactDetails interface
export interface ContactDetails {
  name: string
  landline: string
  cellphone: string
  email: string
}
