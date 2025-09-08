"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, subDays, startOfDay, endOfDay, subMonths, differenceInDays } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { ErrorDisplay } from "@/components/ErrorDisplay"
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

export default function DashboardContent() {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([]) // New state for documents
  const [notifications, setNotifications] = useState<any[]>([]) // New state for notifications
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [noDataMessage, setNoDataMessage] = useState("")

  // Fetch all necessary data from API route
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        console.log("[v0] Dashboard: Fetching data from API")

        const response = await fetch("/api/dashboard/data")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch dashboard data")
        }

        if (result.success) {
          const { orders, customers, documents, notifications } = result.data

          console.log("[v0] Dashboard: Received orders:", orders?.length || 0)
          console.log("[v0] Dashboard: Received customers:", customers?.length || 0)
          console.log("[v0] Dashboard: Received documents:", documents?.length || 0)
          console.log("[v0] Dashboard: Received notifications:", notifications?.length || 0)

          // Set orders data
          if (orders && orders.length > 0) {
            setAllOrders(orders)
            setNoDataMessage("")
          } else {
            setAllOrders([])
            setNoDataMessage("No orders found in the database. Please create some orders first.")
          }

          // Set other data
          setCustomers(customers || [])
          setDocuments(documents || [])
          setNotifications(notifications || [])

          // Check for individual errors
          if (result.errors?.orders) {
            console.error("[v0] Dashboard: Orders error:", result.errors.orders)
            toast({
              title: "Error fetching orders",
              description: result.errors.orders,
              variant: "destructive",
            })
          }
          if (result.errors?.customers) {
            console.error("[v0] Dashboard: Customers error:", result.errors.customers)
            toast({
              title: "Error fetching customers",
              description: result.errors.customers,
              variant: "destructive",
            })
          }
          if (result.errors?.documents) {
            console.error("[v0] Dashboard: Documents error:", result.errors.documents)
          }
          if (result.errors?.notifications) {
            console.error("[v0] Dashboard: Notifications error:", result.errors.notifications)
          }
        } else {
          throw new Error(result.error || "Unknown error occurred")
        }
      } catch (error) {
        console.error("[v0] Dashboard: Error fetching data:", error)
        toast({
          title: "Error connecting to database",
          description: "Please check your connection and try again",
          variant: "destructive",
        })
        setNoDataMessage("Could not connect to the database. Please check your connection.")
        setAllOrders([])
        setCustomers([])
        setDocuments([])
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
    if (startDate && endDate && allOrders.length > 0) {
      setIsLoading(true)
      setTimeout(() => {
        const filtered = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt || order.created_at)
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
        })
        setFilteredOrders(filtered)
        setIsLoading(false)
      }, 500)
    } else {
      setFilteredOrders(allOrders)
    }
  }, [startDate, endDate, allOrders])

  // --- Real-time Data Calculations and Aggregations ---

  // Calculate order statistics
  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + (order.totalValue || order.total_value || 0), 0)
  const activeOrders = filteredOrders.filter(
    (order) => order.status === "In Progress" || order.status === "in_progress",
  )
  const completedOrders = filteredOrders.filter((order) => order.status === "Completed" || order.status === "completed")
  const pendingOrders = filteredOrders.filter((order) => order.status === "Pending" || order.status === "pending")

  // Sort orders by date for recent activity
  const recentOrders = useMemo(
    () =>
      [...filteredOrders]
        .sort(
          (a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime(),
        )
        .slice(0, 5),
    [filteredOrders],
  )

  // Sort customers by total value of orders for top customers
  const topCustomers = useMemo(() => {
    const customerTotalValues: { [customerId: string]: number } = {}
    allOrders.forEach((order) => {
      const customerId = order.customer_id // Assuming orders have customer_id
      const orderValue = order.totalValue || order.total_value || 0
      if (customerId) {
        customerTotalValues[customerId] = (customerTotalValues[customerId] || 0) + orderValue
      }
    })

    return [...customers]
      .map((customer) => ({
        ...customer,
        totalSpentValue: customerTotalValues[customer.id] || 0, // Add new property
      }))
      .sort((a, b) => b.totalSpentValue - a.totalSpentValue)
      .slice(0, 3)
  }, [customers, allOrders])

  // Combined order status data for visualization
  const orderStatusData = useMemo(
    () => [
      { name: "Active", value: activeOrders.length, color: "#3b82f6" },
      { name: "Completed", value: completedOrders.length, color: "#10b981" },
      { name: "Pending", value: pendingOrders.length, color: "#f59e0b" },
    ],
    [activeOrders.length, completedOrders.length, pendingOrders.length],
  )

  // Monthly order trend data
  const monthlyOrderTrendData = useMemo(() => {
    const oneYearAgo = subMonths(new Date(), 11)
    const monthlyCounts: { [key: string]: number } = {}

    for (let i = 0; i < 12; i++) {
      const month = format(subMonths(new Date(), 11 - i), "MMM")
      monthlyCounts[month] = 0
    }

    allOrders.forEach((order) => {
      const orderDate = new Date(order.created_at || order.createdAt)
      if (orderDate >= oneYearAgo) {
        const month = format(orderDate, "MMM")
        monthlyCounts[month]++
      }
    })

    return Object.keys(monthlyCounts).map((month) => ({
      name: month,
      value: monthlyCounts[month],
    }))
  }, [allOrders])

  // Calculate average order processing time
  const averageProcessingTime = useMemo(() => {
    const completedOrdersWithDates = allOrders
      .filter((order) => order.status === "Completed" || order.status === "completed")
      .filter((order) => order.created_at && order.completed_at) // Assuming completed_at exists

    if (!completedOrdersWithDates || completedOrdersWithDates.length === 0)
      return { value: 0, unit: "days", target: 2, trend: 0 }

    const totalDays = completedOrdersWithDates.reduce((sum, order) => {
      const created = new Date(order.created_at)
      const completed = new Date(order.completed_at)
      return sum + differenceInDays(completed, created)
    }, 0)

    const avgDays = completedOrdersWithDates.length > 0 ? totalDays / completedOrdersWithDates.length : 0
    const targetDays = 2 // Example target
    const trend = avgDays - targetDays // Positive means slower, negative means faster

    return {
      value: Number.parseFloat(avgDays.toFixed(1)),
      unit: "days",
      target: targetDays,
      trend: Number.parseFloat(trend.toFixed(1)),
    }
  }, [allOrders])

  // Calculate order value distribution
  const orderValueDistribution = useMemo(() => {
    const ranges = [
      { label: "R 0 - R 1,000", min: 0, max: 1000 },
      { label: "R 1,001 - R 5,000", min: 1001, max: 5000 },
      { label: "R 5,001 - R 10,000", min: 5001, max: 10000 },
      { label: "R 10,001 - R 50,000", min: 10001, max: 50000 },
      { label: "R 50,001+", min: 50001, max: Number.POSITIVE_INFINITY },
    ]

    const counts: { [key: string]: number } = {}
    ranges.forEach((range) => (counts[range.label] = 0))

    filteredOrders.forEach((order) => {
      const value = order.total_value || order.totalValue || 0
      for (const range of ranges) {
        if (value >= range.min && value <= range.max) {
          counts[range.label]++
          break
        }
      }
    })

    const totalOrdersInFiltered = filteredOrders?.length || 0
    return ranges.map((range) => ({
      label: range.label,
      percentage: totalOrdersInFiltered > 0 ? (counts[range.label] / totalOrdersInFiltered) * 100 : 0,
    }))
  }, [filteredOrders])

  // Customer Acquisition Data
  const customerAcquisitionData = useMemo(() => {
    const oneYearAgo = subMonths(new Date(), 11)
    const monthlyCounts: { [key: string]: number } = {}

    for (let i = 0; i < 12; i++) {
      const month = format(subMonths(new Date(), 11 - i), "MMM")
      monthlyCounts[month] = 0
    }

    customers.forEach((customer) => {
      const customerDate = new Date(customer.created_at || customer.createdAt)
      if (customerDate >= oneYearAgo) {
        const month = format(customerDate, "MMM")
        monthlyCounts[month]++
      }
    })

    const data = Object.keys(monthlyCounts).map((month) => ({
      name: month,
      value: monthlyCounts[month],
    }))

    const totalNew = data.reduce((sum, item) => sum + item.value, 0)
    const monthlyAvg = data && data.length > 0 ? totalNew / data.length : 0
    const growth =
      data.length > 1 && data[0].value > 0 ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100 : 0

    return {
      data,
      totalNew: totalNew,
      monthlyAvg: Number.parseFloat(monthlyAvg.toFixed(1)),
      growth: Number.parseFloat(growth.toFixed(1)),
    }
  }, [customers])

  // Customer Retention Rate
  const customerRetentionRate = useMemo(() => {
    const customerOrderCounts: { [key: string]: number } = {}
    allOrders.forEach((order) => {
      if (order.customer_id) {
        customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1
      }
    })

    const totalCustomersWithOrders = Object.keys(customerOrderCounts).length
    const repeatCustomers = Object.values(customerOrderCounts).filter((count) => count > 1).length

    if (totalCustomersWithOrders === 0) return { percentage: 0, description: "No customers with orders yet." }

    const retention = (repeatCustomers / totalCustomersWithOrders) * 100
    return {
      percentage: Number.parseFloat(retention.toFixed(0)),
      description: `${Number.parseFloat(retention.toFixed(0))}% of customers place repeat orders`,
    }
  }, [allOrders])

  // Performance Metrics Data
  const performanceMetrics = useMemo(() => {
    // Delivery Target: On-time delivery rate
    const completedDeliveries = allOrders.filter(
      (order) =>
        (order.status === "Completed" || order.status === "completed") &&
        order.delivery_date &&
        order.actual_delivery_date,
    )
    const onTimeDeliveries = completedDeliveries.filter(
      (order) => new Date(order.actual_delivery_date) <= new Date(order.delivery_date),
    ).length
    const deliveryRate = completedDeliveries.length > 0 ? (onTimeDeliveries / completedDeliveries.length) * 100 : 0

    // Order Processing: Average processing time (re-using calculated averageProcessingTime)
    const orderProcessingValue = averageProcessingTime.value
    const orderProcessingTarget = averageProcessingTime.target

    // Documentation: Average document processing time
    const processedDocuments = documents.filter((doc) => doc.created_at && doc.processed_at)
    const totalDocProcessingDays = processedDocuments.reduce((sum, doc) => {
      const created = new Date(doc.created_at)
      const processed = new Date(doc.processed_at)
      return sum + differenceInDays(processed, created)
    }, 0)
    const avgDocProcessingDays =
      processedDocuments && processedDocuments.length > 0 ? totalDocProcessingDays / processedDocuments.length : 0

    return [
      {
        title: "Delivery Target",
        description: "On-time delivery rate",
        value: Number.parseFloat(deliveryRate.toFixed(0)),
        target: 100, // Target is 100%
        timeframe: "Current",
        status: deliveryRate >= 90 ? "On Track" : "Needs Attention",
        statusColor: deliveryRate >= 90 ? "bg-green-900" : "bg-orange-900",
        progressColor: deliveryRate >= 90 ? "bg-green-500" : "bg-orange-500",
        color: deliveryRate >= 90 ? "text-green-500" : "text-orange-500",
        icon: "Truck",
        daysLeft: 0, // Not applicable for rate
      },
      {
        title: "Order Processing",
        description: "Average order completion time",
        value: orderProcessingValue,
        target: orderProcessingTarget,
        timeframe: "Target: " + orderProcessingTarget + " days",
        status: orderProcessingValue <= orderProcessingTarget ? "On Track" : "Delayed",
        statusColor: orderProcessingValue <= orderProcessingTarget ? "bg-green-900" : "bg-red-900",
        progressColor: orderProcessingValue <= orderProcessingTarget ? "bg-green-500" : "bg-red-500",
        color: orderProcessingValue <= orderProcessingTarget ? "text-green-500" : "text-red-500",
        icon: "Package",
        daysLeft: 0, // Not applicable for average
      },
      {
        title: "Documentation",
        description: "Average document processing time",
        value: Number.parseFloat(avgDocProcessingDays.toFixed(1)),
        target: 3, // Example target for document processing in days
        timeframe: "Target: 3 days",
        status: avgDocProcessingDays <= 3 ? "On Track" : "Delayed",
        statusColor: avgDocProcessingDays <= 3 ? "bg-green-900" : "bg-red-900",
        progressColor: avgDocProcessingDays <= 3 ? "bg-green-500" : "bg-red-500",
        color: avgDocProcessingDays <= 3 ? "text-green-500" : "text-red-500",
        icon: "FileText",
        daysLeft: 0, // Not applicable for average
      },
    ]
  }, [allOrders, averageProcessingTime, documents])

  // Delivery Performance Chart Data
  const deliveryPerformanceData = useMemo(() => {
    const oneYearAgo = subMonths(new Date(), 11)
    const monthlyData: { [key: string]: { total: number; onTime: number } } = {}

    for (let i = 0; i < 12; i++) {
      const month = format(subMonths(new Date(), 11 - i), "MMM")
      monthlyData[month] = { total: 0, onTime: 0 }
    }

    allOrders.forEach((order) => {
      const orderDate = new Date(order.created_at || order.createdAt)
      if (orderDate >= oneYearAgo && (order.status === "Completed" || order.status === "completed")) {
        const month = format(orderDate, "MMM")
        monthlyData[month].total++
        if (
          order.delivery_date &&
          order.actual_delivery_date &&
          new Date(order.actual_delivery_date) <= new Date(order.delivery_date)
        ) {
          monthlyData[month].onTime++
        }
      }
    })

    return Object.keys(monthlyData).map((month) => ({
      name: month,
      value: monthlyData[month].total > 0 ? (monthlyData[month].onTime / monthlyData[month].total) * 100 : 0,
    }))
  }, [allOrders])

  // Operational Efficiency Chart Data (simplified: average order value per month)
  const operationalEfficiencyData = useMemo(() => {
    const oneYearAgo = subMonths(new Date(), 11)
    const monthlyData: { [key: string]: { totalValue: number; count: number } } = {}

    for (let i = 0; i < 12; i++) {
      const month = format(subMonths(new Date(), 11 - i), "MMM")
      monthlyData[month] = { totalValue: 0, count: 0 }
    }

    allOrders.forEach((order) => {
      const orderDate = new Date(order.created_at || order.createdAt)
      if (orderDate >= oneYearAgo) {
        const month = format(orderDate, "MMM")
        monthlyData[month].totalValue += order.total_value || order.totalValue || 0
        monthlyData[month].count++
      }
    })

    return Object.keys(monthlyData).map((month) => ({
      name: month,
      value: monthlyData[month].count > 0 ? monthlyData[month].totalValue / monthlyData[month].count : 0,
    }))
  }, [allOrders])

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
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    console.log("Marking all notifications as read")
  }, [])

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

  useEffect(() => {
    try {
      // Your initialization logic here
    } catch (error: any) {
      console.error("Error in DashboardContent:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.")
    }
  }, [])

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
          customers={customers}
          orderStatusData={orderStatusData}
          monthlyOrderTrendData={monthlyOrderTrendData}
          activeOrders={activeOrders}
          pendingOrders={pendingOrders}
          recentOrders={recentOrders}
          averageProcessingTime={averageProcessingTime}
          orderValueDistribution={orderValueDistribution}
          topCustomers={topCustomers}
          customerAcquisitionData={customerAcquisitionData}
          customerRetentionRate={customerRetentionRate}
          performanceMetrics={performanceMetrics}
          deliveryPerformanceData={deliveryPerformanceData}
          operationalEfficiencyData={operationalEfficiencyData}
        />
      </div>
    </div>
  )
}
