export type UserRole = "admin" | "manager" | "employee" | "client" | "guest" | "tracking"

export interface User {
  id: string // Maps to user_profiles.id (uuid)
  user_id?: string // Maps to user_profiles.user_id (uuid) - foreign key to auth.users
  customer_id?: string // Maps to user_profiles.customer_id (uuid) - foreign key to customers
  username?: string // Generated from first_name.surname
  name?: string // Maps to user_profiles.first_name for compatibility
  first_name?: string // Maps to user_profiles.first_name (text)
  surname?: string // Maps to user_profiles.surname (text)
  full_name?: string // Maps to user_profiles.full_name (text)
  email: string // Maps to user_profiles.email (text)
  role: UserRole // Maps to user_profiles.role (text)
  department?: string // Maps to user_profiles.department (text)
  pageAccess?: string[] // Maps to user_profiles.page_access (text) - parsed as array
  page_access?: string // Raw page_access from database
  created_at?: string // Maps to user_profiles.created_at (timestamp)
  updated_at?: string // Maps to user_profiles.updated_at (timestamp)
}

// Role permissions mapping
export const rolePermissions = {
  admin: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create: true, edit: true, delete: true },
    deliveries: { view: true, create: true, edit: true, delete: true },
    courierOrders: { view: true, create: true, edit: true, delete: true },
    containerTracking: { view: true, create: true, edit: true, delete: true },
    clientPortal: { view: true, create: true, edit: true, delete: true },
    currencyConversion: { view: true, create: true, edit: true, delete: true },
    rateCard: { view: true, create: true, edit: true, delete: true },
    auditTrail: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true },
    shipmentTracker: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create: true, edit: true, delete: false },
    deliveries: { view: true, create: true, edit: true, delete: false },
    courierOrders: { view: true, create: true, edit: true, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
  },
  employee: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create: true, edit: false, delete: false },
    deliveries: { view: true, create: false, edit: false, delete: false },
    courierOrders: { view: true, create: true, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
  },
  client: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: true, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
  },
  guest: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
  },
  tracking: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
  },
}

export interface UserGroup {
  id: string
  name: string
  description?: string
  permissions: GroupPermission[]
  users: User[]
  created_at: string
  updated_at: string
}

export interface GroupPermission {
  id: string
  group_id: string
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  created_at: string
  updated_at: string
}
