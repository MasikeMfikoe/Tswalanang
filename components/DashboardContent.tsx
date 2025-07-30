"use client"

import { useState, useEffect, useMemo } from "react"
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList"
import { OrderStatistics } from "@/components/dashboard/OrderStatistics"
import { TopCustomers } from "@/components/dashboard/TopCustomers"
import { CustomerStatistics } from "@/components/dashboard/CustomerStatistics"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/lib/toast"

type DateRange = {
  startDate: Date | null
  endDate: Date | null
}

type PeriodOption = {
  label: string
  value: string
  getDateRange: () => DateRange
}

interface DashboardData {
  orders: any[]
  customers: any[]
  courierOrders: any[]
  estimates: any[]
  deliveries: any[]
  documents: any[]
}

interface PerformanceData {
  avgProcessingTime: number
  onTimeDeliveryRate: number
  customerRetentionRate: number
  monthlyOrderTrend: Array<{ name: string; value: number }>
  customerAcquisitionTrend: Array<{ name: string; value: number }>
  orderValueDistribution: Array<{ range: string; percentage: number }>
}

export default function DashboardContent() {
  // Supabase client
  const supabase = createClientComponentClient()

  // Error handling state
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Dashboard state
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    orders: [],
    customers: [],
    courierOrders: [],
    estimates: [],
    deliveries: [],
    documents: [],
  })
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    avgProcessingTime: 0,
    onTimeDeliveryRate: 0,
    customerRetentionRate: 0,
    monthlyOrderTrend: [],
    customerAcquisitionTrend: [],
    orderValueDistribution: [],
  })
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [noDataMessage, setNoDataMessage] = useState("")

  // Fetch comprehensive data from Supabase
  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true)
      try {
        // Fetch all data in parallel
        const [ordersResult, customersResult, courierOrdersResult, estimatesResult, deliveriesResult, documentsResult] =
          await Promise.all([
            supabase.from("orders").select("*").order("created_at", { ascending: false }),
            supabase.from("customers").select("*").order("created_at", { ascending: false }),
            supabase.from("courier_orders").select("*").order("created_at", { ascending: false }),
            supabase.from("estimates").select("*").order("created_at", { ascending: false }),
            supabase.from("deliveries").select("*").order("created_at", { ascending: false }),
            supabase.from("documents").select("*").order("created_at", { ascending: false }),
          ])

        // Handle orders
        if (ordersResult.error) {
          console.error("Error fetching orders:", ordersResult.error)
          toast({
            title: "Error fetching orders",
            description: "Could not retrieve orders from database",
            variant: "destructive",
          })
        }

        // Handle customers
        if (customersResult.error) {
          console.error("Error fetching customers:", customersResult.error)
          toast({
            title: "Error fetching customers",
            description: "Could not retrieve customers from database",
            variant: "destructive",
          })
        }

        // Set dashboard data
        const newDashboardData: DashboardData = {
          orders: ordersResult.data || [],
          customers: customersResult.data || [],
          courierOrders: courierOrdersResult.data || [],
          estimates: estimatesResult.data || [],
          deliveries: deliveriesResult.data || [],
          documents: documentsResult.data || [],
        }

        setDashboardData(newDashboardData)

        // Calculate performance metrics from real data
        const perfData = calculatePerformanceMetrics(newDashboardData)
        setPerformanceData(perfData)

        // Set no data message if needed
        if (newDashboardData.orders.length === 0) {
          setNoDataMessage("No orders found in the database. Please create some orders first.")
        } else {
          setNoDataMessage("")
        }
      } catch (error) {
        console.error("Error in data fetching:", error)
        toast({
          title: "Error connecting to database",
          description: "Please check your connection and try again",
          variant: "destructive",
        })
        setNoDataMessage("Could not connect to the database. Please check your connection.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [supabase])

  // Calculate performance metrics from real data
  const calculatePerformanceMetrics = (data: DashboardData): PerformanceData => {
    const { orders, customers, courierOrders, deliveries } = data

    // Calculate average processing time
    const completedOrders = orders.filter((order) => order.status === "Completed" || order.status === "completed")

    let avgProcessingTime = 0
    if (completedOrders.length > 0) {
      const totalProcessingTime = completedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at || order.createdAt)
        const updated = new Date(order.updated_at || order.updatedAt || order.created_at || order.createdAt)
        const diffDays = Math.max(1, Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
        return sum + diffDays
      }, 0)
      avgProcessingTime = totalProcessingTime / completedOrders.length
    }

    // Calculate on-time delivery rate
    const deliveredOrders = [...orders, ...courierOrders, ...deliveries].filter(
      (item) => item.status === "delivered" || item.status === "Completed",
    )
    const onTimeDeliveries = deliveredOrders.filter((item) => {
      // Assume on-time if delivered within estimated time or no delays recorded
      return !item.delayed && !item.late
    })
    const onTimeDeliveryRate = deliveredOrders.length > 0 ? (onTimeDeliveries.length / deliveredOrders.length) * 100 : 0

    // Calculate customer retention rate
    const customersWithMultipleOrders = customers.filter((customer) => {
      const customerOrders = orders.filter(
        (order) => order.customer_id === customer.id || order.customerName === customer.name,
      )
      return customerOrders.length > 1
    })
    const customerRetentionRate =
      customers.length > 0 ? (customersWithMultipleOrders.length / customers.length) * 100 : 0

    // Calculate monthly order trend (last 12 months)
    const monthlyOrderTrend = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at || order.createdAt)
        return orderDate >= monthStart && orderDate <= monthEnd
      })
      monthlyOrderTrend.push({
        name: format(monthStart, "MMM"),
        value: monthOrders.length,
      })
    }

    // Calculate customer acquisition trend (last 6 months)
    const customerAcquisitionTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))
      const newCustomers = customers.filter((customer) => {
        const customerDate = new Date(customer.created_at || customer.createdAt)
        return customerDate >= monthStart && customerDate <= monthEnd
      })
      customerAcquisitionTrend.push({
        name: format(monthStart, "MMM"),
        value: newCustomers.length,
      })
    }

    // Calculate order value distribution
    const orderValues = orders.map((order) => order.total_value || order.totalValue || 0)
    const totalOrders = orderValues.length

    const orderValueDistribution = [
      {
        range: "R 0 - R 1,000",
        percentage: totalOrders > 0 ? (orderValues.filter((v) => v <= 1000).length / totalOrders) * 100 : 0,
      },
      {
        range: "R 1,001 - R 5,000",
        percentage: totalOrders > 0 ? (orderValues.filter((v) => v > 1000 && v <= 5000).length / totalOrders) * 100 : 0,
      },
      {
        range: "R 5,001 - R 10,000",
        percentage:
          totalOrders > 0 ? (orderValues.filter((v) => v > 5000 && v <= 10000).length / totalOrders) * 100 : 0,
      },
      {
        range: "R 10,001 - R 50,000",
        percentage:
          totalOrders > 0 ? (orderValues.filter((v) => v > 10000 && v <= 50000).length / totalOrders) * 100 : 0,
      },
      {
        range: "R 50,001+",
        percentage: totalOrders > 0 ? (orderValues.filter((v) => v > 50000).length / totalOrders) * 100 : 0,
      },
    ]

    return {
      avgProcessingTime,
      onTimeDeliveryRate,
      customerRetentionRate,
      monthlyOrderTrend,
      customerAcquisitionTrend,
      orderValueDistribution,
    }
  }

  // Predefined period options
  const periodOptions: PeriodOption[] = useMemo(
    () => [
      {
        label: "Today",
        value: "today",
        getDateRange: () => ({
          startDate: startOfDay(new Date()),
          endDate: endOfDay(new Date()),
        }),
      },
      {
        label: "Yesterday",
        value: "yesterday",
        getDateRange: () => ({
          startDate: startOfDay(subDays(new Date(), 1)),
          endDate: endOfDay(subDays(new Date(), 1)),
        }),
      },
      {
        label: "Last 7 days",
        value: "last7days",
        getDateRange: () => ({
          startDate: startOfDay(subDays(new Date(), 6)),
          endDate: endOfDay(new Date()),
        }),
      },
      {
        label: "Last 30 days",
        value: "last30days",
        getDateRange: () => ({
          startDate: startOfDay(subDays(new Date(), 29)),
          endDate: endOfDay(new Date()),
        }),
      },
      {
        label: "This month",
        value: "thisMonth",
        getDateRange: () => {
          const now = new Date()
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          return {
            startDate: startOfDay(firstDay),
            endDate: endOfDay(new Date()),
          }
        },
      },
      {
        label: "Last month",
        value: "lastMonth",
        getDateRange: () => {
          const now = new Date()
          const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
          return {
            startDate: startOfDay(firstDayLastMonth),
            endDate: endOfDay(lastDayLastMonth),
          }
        },
      },
      {
        label: "This quarter",
        value: "thisQuarter",
        getDateRange: () => {
          const now = new Date()
          const currentMonth = now.getMonth()
          const quarterStartMonth = Math.floor(currentMonth / 3) * 3
          const firstDay = new Date(now.getFullYear(), quarterStartMonth, 1)
          return {
            startDate: startOfDay(firstDay),
            endDate: endOfDay(new Date()),
          }
        },
      },
      {
        label: "Custom range",
        value: "custom",
        getDateRange: () => ({
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
    ],
    [startDate, endDate],
  )

  // Handle period change
  useEffect(() => {
    if (selectedPeriod === "custom") {
      setShowCustomDateRange(true)
      return
    }

    setShowCustomDateRange(false)

    const option = periodOptions.find((opt) => opt.value === selectedPeriod)
    if (option) {
      const { startDate: start, endDate: end } = option.getDateRange()
      if (start) setStartDate(format(start, "yyyy-MM-dd"))
      if (end) setEndDate(format(end, "yyyy-MM-dd"))
    }
  }, [selectedPeriod, periodOptions])

  // Date handling improvements
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      setStartDate(format(dateRange[0], "yyyy-MM-dd"))
      setEndDate(format(dateRange[1], "yyyy-MM-dd"))
    }
  }, [dateRange])

  // Filter orders when date range changes
  useEffect(() => {
    if (startDate && endDate && dashboardData.orders.length > 0) {
      setIsLoading(true)
      setTimeout(() => {
        const filtered = dashboardData.orders.filter((order) => {
          const orderDate = new Date(order.created_at || order.createdAt)
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
        })
        setFilteredOrders(filtered)
        setIsLoading(false)
      }, 500)
    } else {
      setFilteredOrders(dashboardData.orders)
    }
  }, [startDate, endDate, dashboardData.orders])

  // Calculate order statistics
  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + (order.total_value || order.totalValue || 0), 0)
  const activeOrders = filteredOrders.filter(
    (order) => order.status === "In Progress" || order.status === "in_progress",
  )
  const completedOrders = filteredOrders.filter((order) => order.status === "Completed" || order.status === "completed")
  const pendingOrders = filteredOrders.filter((order) => order.status === "Pending" || order.status === "pending")

  // Sort orders by date for recent activity
  const recentOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
    .slice(0, 5)

  // Sort customers by total orders for top customers
  const topCustomers = [...dashboardData.customers]
    .map((customer) => {
      const customerOrders = dashboardData.orders.filter(
        (order) => order.customer_id === customer.id || order.customerName === customer.name,
      )
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_value || order.totalValue || 0), 0)
      return {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent,
      }
    })
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 3)

  // Combined order status data for visualization
  const orderStatusData = [
    { name: "Active", value: activeOrders.length, color: "#3b82f6" },
    { name: "Completed", value: completedOrders.length, color: "#10b981" },
    { name: "Pending", value: pendingOrders.length, color: "#f59e0b" },
  ]

  // Performance metrics data from real calculations
  const performanceMetrics = [
    {
      title: "Delivery Performance",
      description: "On-time delivery completion rate",
      value: Math.round(performanceData.onTimeDeliveryRate),
      target: 95,
      timeframe: "Current Period",
      status:
        performanceData.onTimeDeliveryRate >= 90
          ? "On Track"
          : performanceData.onTimeDeliveryRate >= 75
            ? "At Risk"
            : "Behind",
      statusColor:
        performanceData.onTimeDeliveryRate >= 90
          ? "bg-green-900"
          : performanceData.onTimeDeliveryRate >= 75
            ? "bg-yellow-900"
            : "bg-red-900",
      progressColor:
        performanceData.onTimeDeliveryRate >= 90
          ? "bg-green-500"
          : performanceData.onTimeDeliveryRate >= 75
            ? "bg-yellow-500"
            : "bg-red-500",
      color:
        performanceData.onTimeDeliveryRate >= 90
          ? "text-green-500"
          : performanceData.onTimeDeliveryRate >= 75
            ? "text-yellow-500"
            : "text-red-500",
      icon: "Truck",
      daysLeft: 30,
    },
    {
      title: "Order Processing",
      description: "Average processing time efficiency",
      value: Math.round(performanceData.avgProcessingTime * 10), // Convert days to a percentage-like metric
      target: 100,
      timeframe: "Current Period",
      status:
        performanceData.avgProcessingTime <= 2
          ? "Excellent"
          : performanceData.avgProcessingTime <= 3
            ? "Good"
            : "Needs Improvement",
      statusColor:
        performanceData.avgProcessingTime <= 2
          ? "bg-green-900"
          : performanceData.avgProcessingTime <= 3
            ? "bg-yellow-900"
            : "bg-red-900",
      progressColor:
        performanceData.avgProcessingTime <= 2
          ? "bg-green-500"
          : performanceData.avgProcessingTime <= 3
            ? "bg-yellow-500"
            : "bg-red-500",
      color:
        performanceData.avgProcessingTime <= 2
          ? "text-green-500"
          : performanceData.avgProcessingTime <= 3
            ? "text-yellow-500"
            : "text-red-500",
      icon: "Package",
      daysLeft: 30,
    },
    {
      title: "Customer Retention",
      description: "Customer retention and loyalty rate",
      value: Math.round(performanceData.customerRetentionRate),
      target: 80,
      timeframe: "Current Period",
      status:
        performanceData.customerRetentionRate >= 75
          ? "Excellent"
          : performanceData.customerRetentionRate >= 60
            ? "Good"
            : "Needs Focus",
      statusColor:
        performanceData.customerRetentionRate >= 75
          ? "bg-green-900"
          : performanceData.customerRetentionRate >= 60
            ? "bg-yellow-900"
            : "bg-red-900",
      progressColor:
        performanceData.customerRetentionRate >= 75
          ? "bg-green-500"
          : performanceData.customerRetentionRate >= 60
            ? "bg-yellow-500"
            : "bg-red-500",
      color:
        performanceData.customerRetentionRate >= 75
          ? "text-green-500"
          : performanceData.customerRetentionRate >= 60
            ? "text-yellow-500"
            : "text-red-500",
      icon: "FileText",
      daysLeft: 30,
    },
  ]

  // Mock notifications (these could also be made dynamic)
  const notifications = [
    { id: 1, title: "New Order", message: "Order PO-2024-006 has been created", time: "5 minutes ago", read: false },
    {
      id: 2,
      title: "Order Status",
      message: "Order PO-2024-003 has been completed",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Delivery Alert",
      message: "Delivery for Order PO-2024-002 is delayed",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      title: "New Customer",
      message: "New customer 'Global Enterprises' has been added",
      time: "Yesterday",
      read: true,
    },
  ]

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Quick date selection function
  const quickSelectDate = (days: number) => {
    const end = new Date()
    const start = subDays(end, days)
    setStartDate(format(start, "yyyy-MM-dd"))
    setEndDate(format(end, "yyyy-MM-dd"))
    setSelectedPeriod(days === 6 ? "last7days" : days === 29 ? "last30days" : "custom")
  }

  // Calendar date selection
  const handleCalendarSelect = (date: Date) => {
    if (!dateRange[0] || (dateRange[0] && dateRange[1])) {
      setDateRange([date, null])
    } else {
      if (date < dateRange[0]) {
        setDateRange([date, dateRange[0]])
      } else {
        setDateRange([dateRange[0], date])
      }
    }
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    console.log("Marking all notifications as read")
  }

  // Apply date range
  const applyDateRange = () => {
    if (startDate && endDate) {
      console.log(`Applying date range: ${startDate} to ${endDate}`)
    }
  }

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[180px] w-full rounded-xl" />
      </div>
    </div>
  )

  // Date range error handling
  const dateError = dateRange[0] && dateRange[1] && dateRange[0] > dateRange[1]

  // Add this near the top of your component
  useEffect(() => {
    try {
      // Your initialization logic here
    } catch (error: any) {
      console.error("Error in DashboardContent:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.")
    }
  }, [])

  // Use error boundary pattern instead
  if (hasError) {
    return <ErrorDisplay title="Error" message={errorMessage} />
  }

  return (
    <div className={`min-h-screen h-full overflow-y-auto ${isDarkMode ? "bg-zinc-950" : "bg-gray-50"}`}>
      <div className="p-6">
        {/* Header with improved controls */}
        <DashboardHeader
          isDarkMode={isDarkMode}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPeriod={selectedPeriod}
          periodOptions={periodOptions}
          setSelectedPeriod={setSelectedPeriod}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          quickSelectDate={quickSelectDate}
          applyDateRange={applyDateRange}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
          markAllAsRead={markAllAsRead}
          toggleTheme={toggleTheme}
          dateError={dateError}
        />

        {/* No data message */}
        {!isLoading && noDataMessage && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {noDataMessage}
            </p>
          </div>
        )}

        {/* Dashboard Tabs */}
        <DashboardTabs
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLoading={isLoading}
          renderSkeleton={renderSkeleton}
          filteredOrders={filteredOrders}
          totalOrderValue={totalOrderValue}
          completedOrders={completedOrders}
          customers={dashboardData.customers}
          orderStatusData={orderStatusData}
          monthlyOrderTrendData={performanceData.monthlyOrderTrend}
          activeOrders={activeOrders}
          pendingOrders={pendingOrders}
        >
          <Tabs>
            {/* Orders Tab Content */}
            <TabsContent value="orders" className="mt-4">
              {isLoading ? (
                renderSkeleton()
              ) : (
                <>
                  <RecentOrdersList isDarkMode={isDarkMode} recentOrders={recentOrders} />
                  <OrderStatistics
                    isDarkMode={isDarkMode}
                    avgProcessingTime={performanceData.avgProcessingTime}
                    orderValueDistribution={performanceData.orderValueDistribution}
                  />
                </>
              )}
            </TabsContent>

            {/* Customers Tab Content */}
            <TabsContent value="customers" className="mt-4">
              {isLoading ? (
                renderSkeleton()
              ) : (
                <>
                  <TopCustomers isDarkMode={isDarkMode} topCustomers={topCustomers} />
                  <CustomerStatistics
                    isDarkMode={isDarkMode}
                    customerAcquisitionTrend={performanceData.customerAcquisitionTrend}
                    customerRetentionRate={performanceData.customerRetentionRate}
                  />
                </>
              )}
            </TabsContent>

            {/* Performance Tab Content */}
            <TabsContent value="performance" className="mt-4">
              {isLoading ? (
                renderSkeleton()
              ) : (
                <>
                  <PerformanceMetrics isDarkMode={isDarkMode} performanceMetrics={performanceMetrics} />
                  <PerformanceCharts
                    isDarkMode={isDarkMode}
                    onTimeDeliveryRate={performanceData.onTimeDeliveryRate}
                    avgProcessingTime={performanceData.avgProcessingTime}
                    monthlyOrderTrend={performanceData.monthlyOrderTrend}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </DashboardTabs>
      </div>
    </div>
  )
}
