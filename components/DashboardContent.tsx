"use client"

import { useState, useEffect, useMemo } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPISummaryCards } from "@/components/dashboard/KPISummaryCards"
import type { Order, Customer } from "@/types/models" // Adjust path as necessary

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [noDataMessage, setNoDataMessage] = useState("")

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch orders from Supabase
        const { data: ordersData, error: ordersError } = await supabase.from("orders").select("*")

        if (ordersError) {
          console.error("Error fetching orders:", ordersError)
          toast({
            title: "Error fetching orders",
            description: "Could not retrieve orders from database",
            variant: "destructive",
          })
          setNoDataMessage("Could not retrieve orders from database. Please check your connection.")
          setAllOrders([])
        } else if (ordersData && ordersData.length > 0) {
          setAllOrders(ordersData)
          setNoDataMessage("")
        } else {
          setAllOrders([])
          setNoDataMessage("No orders found in the database. Please create some orders first.")
        }

        // Fetch customers from Supabase
        const { data: customersData, error: customersError } = await supabase.from("customers").select("*")

        if (customersError) {
          console.error("Error fetching customers:", customersError)
          toast({
            title: "Error fetching customers",
            description: "Could not retrieve customers from database",
            variant: "destructive",
          })
          setCustomers([])
        } else if (customersData && customersData.length > 0) {
          setCustomers(customersData)
        } else {
          setCustomers([])
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

    fetchData()
  }, [supabase])

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

  // Calculate order statistics
  const totalOrderValue = filteredOrders.reduce((sum, order) => sum + (order.totalValue || order.total_value || 0), 0)
  const activeOrders = filteredOrders.filter(
    (order) => order.status === "In Progress" || order.status === "in_progress",
  )
  const completedOrders = filteredOrders.filter((order) => order.status === "Completed" || order.status === "completed")
  const pendingOrders = filteredOrders.filter((order) => order.status === "Pending" || order.status === "pending")

  // Sort orders by date for recent activity
  const recentOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
    .slice(0, 5)

  // Sort customers by total orders for top customers
  const topCustomers = [...customers]
    .sort((a, b) => (b.totalOrders || b.total_orders || 0) - (a.totalOrders || a.total_orders || 0))
    .slice(0, 3)

  // Combined order status data for visualization
  const orderStatusData = [
    { name: "Active", value: activeOrders.length, color: "#3b82f6" },
    { name: "Completed", value: completedOrders.length, color: "#10b981" },
    { name: "Pending", value: pendingOrders.length, color: "#f59e0b" },
  ]

  // Monthly order trend data - this should ideally come from Supabase too
  // For now we'll keep this as is since it requires more complex aggregation
  const monthlyOrderTrendData = [
    { name: "Jan", value: 42 },
    { name: "Feb", value: 55 },
    { name: "Mar", value: 67 },
    { name: "Apr", value: 45 },
    { name: "May", value: 78 },
    { name: "Jun", value: 63 },
    { name: "Jul", value: 82 },
    { name: "Aug", value: 91 },
    { name: "Sep", value: 65 },
    { name: "Oct", value: 73 },
    { name: "Nov", value: 88 },
    { name: "Dec", value: 94 },
  ]

  // Performance metrics data
  const performanceMetrics = [
    {
      title: "Delivery Target",
      description: "Monthly delivery completion rate",
      value: 65,
      target: 100,
      timeframe: "Dec 2024",
      status: "In Progress",
      statusColor: "bg-blue-900",
      progressColor: "bg-blue-500",
      color: "text-blue-500",
      icon: "Truck",
      daysLeft: 45,
    },
    {
      title: "Order Processing",
      description: "Order completion efficiency",
      value: 30,
      target: 500,
      timeframe: "Jun 2024",
      status: "Pending",
      statusColor: "bg-orange-900",
      progressColor: "bg-orange-500",
      color: "text-orange-500",
      icon: "Package",
      daysLeft: 180,
    },
    {
      title: "Documentation",
      description: "Document processing rate",
      value: 45,
      target: 1000,
      timeframe: "Mar 2025",
      status: "On Track",
      statusColor: "bg-green-900",
      progressColor: "bg-green-500",
      color: "text-green-500",
      icon: "FileText",
      daysLeft: 120,
    },
  ]

  // Mock notifications
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
    // In a real app, this would call an API to update the notification status
    console.log("Marking all notifications as read")
  }

  // Apply date range
  const applyDateRange = () => {
    if (startDate && endDate) {
      console.log(`Applying date range: ${startDate} to ${endDate}`)
      // This would trigger a data fetch in a real application
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

  // Calculate KPIs
  const totalOrders = allOrders.length
  const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalValue || 0), 0)
  const completedOrdersCount = allOrders.filter((order) => order.status === "Delivered").length
  const inTransitOrdersCount = allOrders.filter((order) => order.status === "In Transit").length
  const activeCustomersCount = customers.length

  // Mock data for now, replace with actual calculations
  const avgDeliveryTime = "3.5 days"
  const onTimeDeliveryRate = "95%"

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <DashboardTabs
            isDarkMode={isDarkMode}
            activeTab={activeTab}
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
          >
            {/* Orders Tab Content */}
            <TabsContent value="orders" className="mt-4">
              {isLoading ? (
                renderSkeleton()
              ) : (
                <>
                  <RecentOrdersList isDarkMode={isDarkMode} recentOrders={recentOrders} />
                  <OrderStatistics isDarkMode={isDarkMode} />
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
                  <CustomerStatistics isDarkMode={isDarkMode} />
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
                  <PerformanceCharts isDarkMode={isDarkMode} />
                </>
              )}
            </TabsContent>
          </DashboardTabs>
        </Tabs>

        {/* KPI Summary Cards */}
        <KPISummaryCards
          totalOrders={totalOrders}
          totalRevenue={totalRevenue}
          avgDeliveryTime={avgDeliveryTime}
          onTimeDeliveryRate={onTimeDeliveryRate}
        />

        {/* Recent Orders Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest activities in your logistics operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersList recentOrders={allOrders.slice(0, 5)} /> {/* Display top 5 recent orders */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
