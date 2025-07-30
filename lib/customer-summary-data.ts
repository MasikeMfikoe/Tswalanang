import { subDays, format } from "date-fns"

// Generate dates for sample data
const today = new Date()
const generateDate = (daysAgo: number) => format(subDays(today, daysAgo), "yyyy-MM-dd'T'HH:mm:ss")

// Sample customers
export const customers = [
  {
    id: "cust-001",
    name: "Global Imports Ltd",
    contactPerson: "John Smith",
    email: "john@globalimports.com",
    phone: "+27 11 555 1234",
    address: {
      street: "123 Main Street",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
    },
    totalOrders: 42,
    totalSpent: 1250000,
    vatNumber: "ZA123456789",
    importersCode: "IMP12345",
    createdAt: generateDate(365),
  },
  {
    id: "cust-002",
    name: "African Traders Co",
    contactPerson: "Sarah Johnson",
    email: "sarah@africantraders.co.za",
    phone: "+27 21 555 5678",
    address: {
      street: "45 Beach Road",
      city: "Cape Town",
      postalCode: "8001",
      country: "South Africa",
    },
    totalOrders: 28,
    totalSpent: 875000,
    vatNumber: "ZA987654321",
    importersCode: "IMP67890",
    createdAt: generateDate(300),
  },
  {
    id: "cust-003",
    name: "Durban Shipping Solutions",
    contactPerson: "Michael Naidoo",
    email: "michael@durbanshipping.com",
    phone: "+27 31 555 9012",
    address: {
      street: "78 Harbor View",
      city: "Durban",
      postalCode: "4001",
      country: "South Africa",
    },
    totalOrders: 35,
    totalSpent: 1050000,
    vatNumber: "ZA456789012",
    importersCode: "IMP34567",
    createdAt: generateDate(250),
  },
  {
    id: "cust-004",
    name: "Eastern Cape Distributors",
    contactPerson: "Lisa van der Merwe",
    email: "lisa@ecdistributors.co.za",
    phone: "+27 41 555 3456",
    address: {
      street: "12 Industrial Drive",
      city: "Port Elizabeth",
      postalCode: "6001",
      country: "South Africa",
    },
    totalOrders: 19,
    totalSpent: 620000,
    vatNumber: "ZA345678901",
    importersCode: "IMP89012",
    createdAt: generateDate(200),
  },
  {
    id: "cust-005",
    name: "Pretoria Logistics Group",
    contactPerson: "David Botha",
    email: "david@pretorialogistics.com",
    phone: "+27 12 555 7890",
    address: {
      street: "56 Government Avenue",
      city: "Pretoria",
      postalCode: "0002",
      country: "South Africa",
    },
    totalOrders: 23,
    totalSpent: 780000,
    vatNumber: "ZA567890123",
    importersCode: "IMP45678",
    createdAt: generateDate(180),
  },
]

// Generate sample orders with realistic data
export const generateOrders = () => {
  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"]
  const freightTypes = ["Air Freight", "Sea Freight", "EXW", "FOB"]
  const orders = []

  // Generate 200 orders distributed among customers
  for (let i = 1; i <= 200; i++) {
    const customerIndex = Math.floor(Math.random() * customers.length)
    const customer = customers[customerIndex]
    const daysAgo = Math.floor(Math.random() * 90) // Orders from last 90 days
    const createdAt = generateDate(daysAgo)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const freightType = freightTypes[Math.floor(Math.random() * freightTypes.length)]

    // Generate a realistic order value based on freight type
    let baseValue = 0
    switch (freightType) {
      case "Air Freight":
        baseValue = 15000 + Math.random() * 25000
        break
      case "Sea Freight":
        baseValue = 25000 + Math.random() * 50000
        break
      case "EXW":
        baseValue = 10000 + Math.random() * 15000
        break
      case "FOB":
        baseValue = 20000 + Math.random() * 30000
        break
    }

    const totalValue = Math.round(baseValue * 100) / 100

    orders.push({
      id: `order-${i.toString().padStart(3, "0")}`,
      poNumber: `PO-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, "0")}`,
      supplier: `Supplier ${Math.floor(Math.random() * 20) + 1}`,
      importer: customer.name,
      status,
      cargoStatus: status === "Completed" ? "delivered" : "in-transit",
      freightType,
      totalValue,
      customerName: customer.name,
      createdAt,
      updatedAt: status !== "Pending" ? generateDate(Math.max(0, daysAgo - 2)) : undefined,
    })
  }

  return orders
}

// Pre-generate orders for consistent data
export const orders = generateOrders()

// Helper function to filter orders by date range and customer
export const filterOrders = (customerName: string | null, startDate: string | null, endDate: string | null) => {
  let filtered = [...orders]

  // Filter by customer
  if (customerName) {
    filtered = filtered.filter((order) => order.importer === customerName)
  }

  // Filter by date range
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Set to end of day

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= start && orderDate <= end
    })
  }

  return filtered
}

// Calculate metrics based on filtered orders
export const calculateMetrics = (filteredOrders: any[]) => {
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalValue, 0)
  const totalVAT = totalRevenue * 0.15
  const totalCustomsDuties = totalRevenue * 0.2
  const orderCount = filteredOrders.length
  const completedOrders = filteredOrders.filter((order) => order.status === "Completed").length
  const inProgressOrders = filteredOrders.filter((order) => order.status !== "Completed").length

  return {
    totalRevenue,
    totalVAT,
    totalCustomsDuties,
    orderCount,
    completedOrders,
    inProgressOrders,
  }
}

// Get recent orders (last 7 days)
export const getRecentOrders = (filteredOrders: any[]) => {
  const sevenDaysAgo = subDays(new Date(), 7)
  return filteredOrders
    .filter((order) => new Date(order.createdAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) // Get top 5 most recent
}

// Get monthly order data for charts
export const getMonthlyOrderData = (filteredOrders: any[]) => {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      month: format(date, "MMM"),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      yearMonth: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`,
    }
  }).reverse()

  const monthlyData = last6Months.map((monthData) => {
    const monthOrders = filteredOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === monthData.monthIndex && orderDate.getFullYear() === monthData.year
    })

    return {
      name: monthData.month,
      value: monthOrders.length,
    }
  })

  return monthlyData
}
