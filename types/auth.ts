export type UserRole = "admin" | "manager" | "employee" | "client" | "guest" | "tracking"

export interface User {
  id: string
  username?: string
  name?: string
  surname?: string
  email: string
  role: UserRole
  department?: string
  pageAccess?: string[]
  customer_id?: string
  created_at?: string
  updated_at?: string
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
