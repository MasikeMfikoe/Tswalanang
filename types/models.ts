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
  poNumber: string
  supplier: string
  importer: string
  status: Status
  cargoStatus: CargoStatus
  freightType: FreightType
  cargoStatusComment?: string
  totalValue: number
  customerName: string
  createdAt: string
  updatedAt?: string
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
  phone: string
  address: Address
  totalOrders: number
  totalSpent: number
  vatNumber?: string
  importersCode?: string
  rateCard?: RateCard
  createdAt?: string
  updatedAt?: string
}

export interface RateCard {
  seaFreight: {
    communicationFee: number
    documentationFee: number
    agencyFee: number
    facilityFee: number
  }
  airFreight: {
    communicationFee: number
    documentationFee: number
    agencyFee: number
    facilityFee: number
  }
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
  customerId: string
  customerName: string
  customerEmail: string
  status: string
  createdAt: string
  updatedAt?: string
  freightType: string
  commercialValue: string
  customsDuties: string
  handlingFees: string
  shippingCost: string
  documentationFee: string
  communicationFee: string
  notes: string
  totalAmount: number
}

// Document model
export interface Document {
  id: string
  name: string
  type: string
  url: string
  order_id: string
  created_at: string
  updated_at?: string
  required?: boolean
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

// Rate Card
export interface RateItem {
  id: string
  name: string
  seaFreight: number
  airFreight: number
  isPercentage: boolean
  percentageBase?: string
}

// Notification
export interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
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
