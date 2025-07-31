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
export type FreightType = "Air Freight" | "Sea Freight" | "EXW" | "FOB"
export type Priority = "High" | "Medium" | "Low"
export type ServiceType = "Express" | "Standard" | "Economy" | "Next Day"
export type EstimateStatus = "Draft" | "Sent" | "Accepted" | "Rejected"

// Order model
export interface Order {
  id: string
  customer_id: string
  customer_name: string
  status: string
  created_at: string
  updated_at: string
  origin: string
  destination: string
  total_amount: number
  currency: string
  tracking_number?: string
  freight_type?: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  notes?: string
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
  documents?: Document[]
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
  contactPerson: string
  email: string
  phone?: string
  address?: string
  totalOrders: number
  totalSpent: number
  vatNumber?: string
  importersCode?: string
  rate_card_id?: string
  createdAt?: string
  updatedAt?: string
  rateCard?: RateCard
}

export interface RateCard {
  id: string
  customer_id: string
  name: string
  valid_from: string
  valid_to: string
  rates: Rate[]
  created_at: string
  updated_at: string
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
  displayId: string // Human-readable ID, e.g., "TSW-0001"
  customerId: string
  customerName: string
  customerEmail: string
  status: "Draft" | "Sent" | "Accepted" | "Rejected"
  freightType: string
  commercialValue: number | string
  customsDuties: number | string
  customsVAT: number | string
  handlingFees: number | string
  shippingCost: number | string
  documentationFee: number | string
  communicationFee: number | string
  totalDisbursements: number | string
  facilityFee: number | string
  agencyFee: number | string
  subtotal: number | string
  vat: number | string
  totalAmount: number
  notes?: string
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
    sender: ContactDetails
    receiver: ContactDetails
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

export interface ContactDetails {
  name: string
  company: string
  phone: string
  email: string
  address: string
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
  carrier: string
  status: string
  origin: string
  destination: string
  scheduled_delivery: string
  actual_delivery?: string
  last_updated: string
  vessel_name?: string
  voyage_number?: string
  container_number?: string
  current_port?: string
  next_port?: string
  eta?: string
  cargo_status_history?: CargoStatusHistory[]
}

export interface CargoStatusHistory {
  id: string
  shipment_id: string
  status: string
  location: string
  timestamp: string
  notes?: string
}

// Notification
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
  user_role?: "admin" | "staff" | "client"
  customer_id?: string // For client users
  created_at?: string
  updated_at?: string
}
