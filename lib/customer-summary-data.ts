import { subDays, format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Real data functions that fetch from Supabase
export const fetchCustomers = async () => {
  const supabase = createClientComponentClient()

  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return customers || []
  } catch (error) {
    console.error("Error in fetchCustomers:", error)
    return []
  }
}

export const fetchOrders = async () => {
  const supabase = createClientComponentClient()

  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return []
    }

    return orders || []
  } catch (error) {
    console.error("Error in fetchOrders:", error)
    return []
  }
}

// Helper function to filter orders by date range and customer
export const filterOrders = (
  orders: any[],
  customerName: string | null,
  startDate: string | null,
  endDate: string | null,
) => {
  let filtered = [...orders]

  // Filter by customer
  if (customerName) {
    filtered = filtered.filter(
      (order) =>
        order.customer_name === customerName ||
        order.customerName === customerName ||
        (order.customer && order.customer.name === customerName),
    )
  }

  // Filter by date range
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Set to end of day

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.created_at || order.createdAt)
      return orderDate >= start && orderDate <= end
    })
  }

  return filtered
}

// Calculate metrics based on filtered orders
export const calculateMetrics = (filteredOrders: any[]) => {
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_value || order.totalValue || 0), 0)
  const totalVAT = totalRevenue * 0.15
  const totalCustomsDuties = totalRevenue * 0.2
  const orderCount = filteredOrders.length
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "Completed" || order.status === "completed",
  ).length
  const inProgressOrders = filteredOrders.filter(
    (order) => order.status !== "Completed" && order.status !== "completed",
  ).length

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
    .filter((order) => new Date(order.created_at || order.createdAt) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
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
      const orderDate = new Date(order.created_at || order.createdAt)
      return orderDate.getMonth() === monthData.monthIndex && orderDate.getFullYear() === monthData.year
    })

    return {
      name: monthData.month,
      value: monthOrders.length,
    }
  })

  return monthlyData
}

// Fetch real customer summary data
export const fetchCustomerSummaryData = async (
  customerId?: string,
  customerName?: string,
  startDate?: string,
  endDate?: string,
) => {
  try {
    const [customers, orders] = await Promise.all([fetchCustomers(), fetchOrders()])

    const filteredOrders = filterOrders(orders, customerName || null, startDate || null, endDate || null)
    const metrics = calculateMetrics(filteredOrders)
    const recentOrders = getRecentOrders(filteredOrders)
    const monthlyData = getMonthlyOrderData(filteredOrders)

    return {
      customers,
      orders: filteredOrders,
      metrics,
      recentOrders,
      monthlyData,
    }
  } catch (error) {
    console.error("Error fetching customer summary data:", error)
    return {
      customers: [],
      orders: [],
      metrics: {
        totalRevenue: 0,
        totalVAT: 0,
        totalCustomsDuties: 0,
        orderCount: 0,
        completedOrders: 0,
        inProgressOrders: 0,
      },
      recentOrders: [],
      monthlyData: [],
    }
  }
}
