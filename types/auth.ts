// types/auth.ts

export type UserRole = "admin" | "manager" | "employee" | "client" | "guest" | "tracking"

export interface User {
  id: string // user_profiles.id (uuid) – PK
  user_id?: string // user_profiles.user_id (uuid) – FK -> auth.users
  customer_id?: string // user_profiles.customer_id (uuid)
  username?: string // generated username
  name?: string // mirrors first_name for compatibility
  first_name?: string
  surname?: string
  full_name?: string
  email: string // required
  role: UserRole // required
  department?: string
  pageAccess?: string[] // parsed from page_access
  page_access?: string // raw DB column
  created_at?: string
  updated_at?: string
}

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
    ediStatusInputs: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create: true, edit: true, delete: false },
    deliveries: { view: true, create: true, edit: true, delete: false },
    courierOrders: { view: true, create: true, edit: true, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: true, create: true, edit: true, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: true, create: true, edit: true, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    ediStatusInputs: { view: true, create: true, edit: true, delete: false },
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
    ediStatusInputs: { view: false, create: false, edit: false, delete: false },
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
    ediStatusInputs: { view: false, create: false, edit: false, delete: false },
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
    ediStatusInputs: { view: false, create: false, edit: false, delete: false },
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
    ediStatusInputs: { view: false, create: false, edit: false, delete: false },
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
  /** maps to DB column `is_default` */
  isDefault: boolean
}

export interface GroupPermission {
  id: string
  group_id: string
  /** path-like code used by the UI to match routes, e.g. "/dashboard", "/orders/new" */
  module: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  created_at: string
  updated_at: string
}
// Page-level permission used by the UI
export interface GroupPermissionPage {
  id: string
  groupId: string
  pagePath: string
  allowed: boolean
}
