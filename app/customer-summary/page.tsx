"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { Activity, Banknote, Clock, TrendingUp, Ship } from "lucide-react"
import { BarChart } from "@/components/Charts"
import { toast } from "@/lib/toast"
import CargoStatusTab from "@/components/CargoStatusTab"
import { createBrowserClient } from "@supabase/ssr"
import type { Customer, Order } from "@/types/models"
import { useAuth } from "@/contexts/AuthContext"

type DateRange = {
  startDate: Date | null
  endDate: Date | null
}

type PeriodOption = {
  label: string
  value: string
  getDateRange: () => DateRange
}

interface TrackingData {
  estimatedArrival?: string
  estimatedDeparture?: string
  actualArrival?: string
  actualDeparture?: string
  currentStatus?: string
  demurrageDays?: number
}

interface OrderWithTracking extends Order {
  trackingData?: TrackingData
}

export default function CustomerSummary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { user } = useAuth()

  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<OrderWithTracking[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderWithTracking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalVAT: 0,
    totalCustomsDuties: 0,
    orderCount: 0,
    completedOrders: 0,
    inProgressOrders: 0,
  })
  const [monthlyOrderData, setMonthlyOrderData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/customer-summary?tab=${value}`)
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("name")

      if (error) {
        throw error
      }

      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchTrackingData = async (trackingNumber: string): Promise<TrackingData | null> => {
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber,
          bookingType: "ocean",
          preferScraping: false,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        return {
          estimatedArrival: result.data.estimatedArrival,
          estimatedDeparture: result.data.estimatedDeparture,
          actualArrival: result.data.actualArrival,
          actualDeparture: result.data.actualDeparture,
          currentStatus: result.data.currentStatus,
          demurrageDays: result.data.demurrageDays,
        }
      }
    } catch (error) {
      console.error(`Error fetching tracking data for ${trackingNumber}:`, error)
    }
    return null
  }

  const enrichOrdersWithTracking = async (orders: Order[]): Promise<OrderWithTracking[]> => {
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        if (order.tracking_number) {
          const trackingData = await fetchTrackingData(order.tracking_number)
          return { ...order, trackingData: trackingData || undefined }
        }
        return order
      }),
    )
    return enrichedOrders
  }

  const periodOptions: PeriodOption[] = [
    {
      label: "Last 7 days",
      value: "last7days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        return { startDate, endDate }
      },
    },
    {
      label: "Last 30 days",
      value: "last30days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        return { startDate, endDate }
      },
    },
    {
      label: "Last 90 days",
      value: "last90days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 90)
        return { startDate, endDate }
      },
    },
    {
      label: "This year",
      value: "thisyear",
      getDateRange: () => {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), 0, 1)
        const endDate = new Date(now.getFullYear(), 11, 31)
        return { startDate, endDate }
      },
    },
    {
      label: "Custom range",
      value: "custom",
      getDateRange: () => ({ startDate: null, endDate: null }),
    },
  ]

  const updateData = useCallback(async () => {
    setIsLoading(true)

    try {
      let query = supabase.from("orders").select("*")

      if (selectedCustomer && selectedCustomer !== "all") {
        query = query.eq("importer", selectedCustomer)
      }

      if (startDate) {
        query = query.gte("created_at", startDate)
      }

      if (endDate) {
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        query = query.lt("created_at", nextDay.toISOString().split("T")[0])
      }

      const { data: orders, error } = await query

      if (error) {
        throw error
      }

      const enrichedOrders = await enrichOrdersWithTracking(orders || [])
      setFilteredOrders(enrichedOrders)

      const totalRevenue = enrichedOrders?.reduce((sum, order) => sum + (order.total_cost || 0), 0) || 0
      const totalVAT = totalRevenue * 0.15
      const totalCustomsDuties = totalRevenue * 0.2

      const orderCount = enrichedOrders?.length || 0
      const completedOrders = enrichedOrders?.filter((order) => order.status === "Completed").length || 0
      const inProgressOrders = orderCount - completedOrders

      setMetrics({
        totalRevenue,
        totalVAT,
        totalCustomsDuties,
        orderCount,
        completedOrders,
        inProgressOrders,
      })

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recent =
        enrichedOrders
          ?.filter((order) => new Date(order.created_at) >= sevenDaysAgo)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) || []

      setRecentOrders(recent)

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
        const monthOrders =
          enrichedOrders?.filter((order) => {
            const orderDate = new Date(order.created_at)
            return orderDate.getMonth() === monthData.monthIndex && orderDate.getFullYear() === monthData.year
          }) || []

        return {
          name: monthData.month,
          value: monthOrders.length,
        }
      })

      setMonthlyOrderData(monthlyData)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load order data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedCustomer, startDate, endDate, supabase])

  useEffect(() => {
    if (startDate && endDate) {
      updateData()
    }
  }, [updateData, startDate, endDate])

  const progressData = [
    { name: "Completed", value: metrics.completedOrders },
    { name: "In Progress", value: metrics.inProgressOrders },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    const selectedOption = periodOptions.find((option) => option.value === value)

    if (selectedOption) {
      if (value === "custom") {
        setShowCustomDateRange(true)
        setStartDate("")
        setEndDate("")
      } else {
        setShowCustomDateRange(false)
        const { startDate: start, endDate: end } = selectedOption.getDateRange()
        if (start && end) {
          setStartDate(start.toISOString().split("T")[0])
          setEndDate(end.toISOString().split("T")[0])
        }
      }
    }
  }

  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      updateData()
    } else {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setSelectedCustomer("")
    setSelectedPeriod("last30days")
    setStartDate("")
    setEndDate("")
    setShowCustomDateRange(false)

    const defaultPeriod = periodOptions.find((option) => option.value === "last30days")
    if (defaultPeriod) {
      const { startDate: start, endDate: end } = defaultPeriod.getDateRange()
      if (start && end) {
        setStartDate(start.toISOString().split("T")[0])
        setEndDate(end.toISOString().split("T")[0])
      }
    }
  }

  useEffect(() => {
    const defaultPeriod = periodOptions.find((option) => option.value === selectedPeriod)
    if (defaultPeriod && selectedPeriod !== "custom") {
      const { startDate: start, endDate: end } = defaultPeriod.getDateRange()
      if (start && end) {
        setStartDate(start.toISOString().split("T")[0])
        setEndDate(end.toISOString().split("T")[0])
      }
    }
  }, [selectedPeriod])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Summary</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Total Orders</p>
                <p className="text-2xl font-bold">{metrics.orderCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Completed Orders</p>
                <p className="text-2xl font-bold">{metrics.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role !== "employee" && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Total VAT</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalVAT)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.name}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCustomDateRange && (
          <>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
          </>
        )}
      </div>

      {showCustomDateRange && (
        <div className="flex gap-2 mb-6">
          <Button onClick={handleCustomDateSubmit}>Apply Date Range</Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cargo-status" className="flex items-center">
            <Ship className="h-4 w-4 mr-2" />
            Cargo Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.orderCount > 0 ? (
                  <BarChart data={progressData} />
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Order Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyOrderData.length > 0 ? (
                  <BarChart data={monthlyOrderData} />
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No data available for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Past 7 days</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                      <div>
                        <p className="font-medium">{order.po_number}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(order.created_at), "MMM dd, yyyy")}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      {user?.role !== "employee" && (
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total_cost || 0)}</p>
                          <p className="text-sm text-muted-foreground">{order.importer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No recent orders found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Order History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} orders found for the selected criteria
                </p>
              </div>
              <Button variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                Export to Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Order Number</th>
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Customer</th>
                        <th className="p-2 text-left font-medium">Freight Type</th>
                        <th className="p-2 text-left font-medium">ETA</th>
                        <th className="p-2 text-left font-medium">ETD</th>
                        <th className="p-2 text-right font-medium">Demurrage/Detention Days</th>
                        {user?.role !== "employee" && (
                          <>
                            <th className="p-2 text-right font-medium">Total Cost</th>
                            <th className="p-2 text-right font-medium">Tax Amount</th>
                            <th className="p-2 text-right font-medium">Customs Duties</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/30">
                          <td className="p-2">{order.po_number}</td>
                          <td className="p-2">{format(parseISO(order.created_at), "MMM dd, yyyy")}</td>
                          <td className="p-2">{order.importer}</td>
                          <td className="p-2">{order.freight_type || "N/A"}</td>
                          <td className="p-2">
                            {order.trackingData?.estimatedArrival
                              ? format(parseISO(order.trackingData.estimatedArrival), "MMM dd, yyyy")
                              : order.estimated_delivery
                                ? format(parseISO(order.estimated_delivery), "MMM dd, yyyy")
                                : "TBD"}
                          </td>
                          <td className="p-2">
                            {order.trackingData?.estimatedDeparture
                              ? format(parseISO(order.trackingData.estimatedDeparture), "MMM dd, yyyy")
                              : "TBD"}
                          </td>
                          <td className="p-2 text-right">{order.trackingData?.demurrageDays || 0} days</td>
                          {user?.role !== "employee" && (
                            <>
                              <td className="p-2 text-right">{formatCurrency(order.total_cost || 0)}</td>
                              <td className="p-2 text-right">
                                {formatCurrency(order.tax_amount || order.total_cost * 0.15 || 0)}
                              </td>
                              <td className="p-2 text-right">{formatCurrency(order.customs_duties || 0)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={user?.role !== "employee" ? 10 : 7}
                            className="p-4 text-center text-muted-foreground"
                          >
                            No orders found for the selected criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    Showing 10 of {filteredOrders.length} orders. Export to Excel to view all.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cargo-status">
          <CargoStatusTab customerId={selectedCustomer || "all"} startDate={startDate} endDate={endDate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
