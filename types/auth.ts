export type UserRole = "admin" | "manager" | "employee" | "guest" | "client" | "tracking"

export interface Permissions {
  [module: string]: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
}

const defaultPermissions: Permissions = {
  dashboard: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  documents: { view: false, create: false, edit: false, delete: false },
  deliveries: { view: false, create: false, edit: false, delete: false },
  customers: { view: false, create: false, edit: false, delete: false },
  currencyConversion: { view: false, create: false, edit: false, delete: false },
  containerTracking: { view: false, create: false, edit: false, delete: false },
  rateCard: { view: false, create: false, edit: false, delete: false },
  auditTrail: { view: false, create: false, edit: false, delete: false },
  admin: { view: false, create: false, edit: false, delete: false },
  courierOrders: { view: false, create: false, edit: false, delete: false },
  shipmentTracker: { view: false, create: false, edit: false, delete: false },
  clientPortal: { view: false, create: false, edit: false, delete: false },
}

export const rolePermissions: Record<UserRole, Permissions> = {
  admin: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create: true, edit: true, delete: true },
    deliveries: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    currencyConversion: { view: true, create: true, edit: true, delete: true },
    containerTracking: { view: true, create: true, edit: true, delete: true },
    rateCard: { view: true, create: true, edit: true, delete: true },
    auditTrail: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true },
    courierOrders: { view: true, create: true, edit: true, delete: true },
    shipmentTracker: { view: true, create: true, edit: true, delete: true },
    clientPortal: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create: true, edit: true, delete: false },
    deliveries: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: true, create: true, edit: true, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
  },
  employee: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: false, delete: false },
    documents: { view: true, create: true, edit: false, delete: false },
    deliveries: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: true, create: true, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
  },
  guest: defaultPermissions,
  tracking: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
  },
  client: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: true, create: false, edit: false, delete: false },
  },
}

export interface User {
  id: string
  name: string
  surname: string
  username: string
  email?: string
  department: string
  role: UserRole
  pageAccess: string[]
  password?: string
  associatedOrders?: string[]
}

export interface UserGroup {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  permissions?: GroupPermission[]
}

export interface GroupPermission {
  id: string
  groupId: string
  pagePath: string
  allowed: boolean
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  getUsers: () => Promise<User[]>
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: "admin" | "user" | "client"
  customer_id?: string
}
