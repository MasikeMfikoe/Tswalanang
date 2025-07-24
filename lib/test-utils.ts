import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { I18nProvider } from "@/lib/i18n"
import { AuthProvider } from "@/contexts/AuthContext"
import { StateProvider } from "@/contexts/StateContext"
import { QueryProvider } from "@/providers/QueryProvider"

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StateProvider>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </StateProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: "mock-user-id",
  username: "mockuser",
  name: "Mock",
  surname: "User",
  role: "admin",
  department: "IT",
  pageAccess: ["dashboard", "orders", "customers", "documents", "deliveries"],
  ...overrides,
})

export const generateMockOrder = (overrides = {}) => ({
  id: `order-${Math.floor(Math.random() * 1000)}`,
  poNumber: `PO-${Math.floor(Math.random() * 10000)}`,
  supplier: "Mock Supplier",
  importer: "Mock Importer",
  status: "In Progress",
  cargoStatus: "in-transit",
  freightType: "Sea Freight",
  totalValue: Math.floor(Math.random() * 100000),
  customerName: "Mock Customer",
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockCustomer = (overrides = {}) => ({
  id: `customer-${Math.floor(Math.random() * 1000)}`,
  name: "Mock Customer",
  contactPerson: "Mock Contact",
  email: "mock@example.com",
  phone: "+27 123 456 7890",
  address: {
    street: "Mock Street",
    city: "Mock City",
    postalCode: "12345",
    country: "South Africa",
  },
  totalOrders: Math.floor(Math.random() * 20),
  totalSpent: Math.floor(Math.random() * 500000),
  ...overrides,
})

// Mock API responses
export const mockApiResponse = (data: any, success = true, message?: string) => ({
  data,
  success,
  message,
})

export const mockPaginatedResponse = (data: any[], page = 1, pageSize = 10, totalItems = 100) => ({
  data,
  success: true,
  pagination: {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  },
})

// Re-export everything from testing-library
export * from "@testing-library/react"
export { customRender as render }

export function renderWithProviders(ui: React.ReactElement, options?: any) {
  return { ...ui, ...options }
}
