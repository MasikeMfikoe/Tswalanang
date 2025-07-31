export const defaultPermissions = {
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
  estimates: { view: false, create: false, edit: false, delete: false },
  userManagement: { view: false, create: false, edit: false, delete: false }, // Added userManagement
}

export type Permissions = typeof defaultPermissions
