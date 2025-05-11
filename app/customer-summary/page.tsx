"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { Activity, Banknote, Clock, TrendingUp } from "lucide-react"
import { BarChart } from "@/components/Charts"
import {
  customers,
  filterOrders,
  calculateMetrics,
  getRecentOrders,
  getMonthlyOrderData,
} from "@/lib/customer-summary-data"
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

export default function CustomerSummary() {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalVAT: 0,
    totalCustomsDuties: 0,
    orderCount: 0,
    completedOrders: 0,
    inProgressOrders: 0,
  })
  const [monthlyOrderData, setMonthlyOrderData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Predefined period options
  const periodOptions: PeriodOption[] = useMemo(
    () => [
      {
        label: "Today",
        value: "today",
        getDateRange: () => {
          const today = new Date()
          return {
            startDate: today,
            endDate: today,
          }
        },
      },
      {
        label: "Yesterday",
        value: "yesterday",
        getDateRange: () => {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          return {
            startDate: yesterday,
            endDate: yesterday,
          }
        },
      },
      {
        label: "Last 7 days",
        value: "last7days",
        getDateRange: () => {
          const end = new Date()
          const start = new Date()
          start.setDate(start.getDate() - 6)
          return {
            startDate: start,
            endDate: end,
          }
        },
      },
      {
        label: "Last 30 days",
        value: "last30days",
        getDateRange: () => {
          const end = new Date()
          const start = new Date()
          start.setDate(start.getDate() - 29)
          return {
            startDate: start,
            endDate: end,
          }
        },
      },
      {
        label: "This month",
        value: "thisMonth",
        getDateRange: () => {
          const now = new Date()
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          return {
            startDate: firstDay,
            endDate: new Date(),
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
            startDate: firstDayLastMonth,
            endDate: lastDayLastMonth,
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

  // Update data when filters change
  const updateData = useCallback(() => {
    setIsLoading(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      const filtered = filterOrders(selectedCustomer || null, startDate || null, endDate || null)

      setFilteredOrders(filtered)
      setRecentOrders(getRecentOrders(filtered))
      setMetrics(calculateMetrics(filtered))
      setMonthlyOrderData(getMonthlyOrderData(filtered))
      setIsLoading(false)
    }, 300)
  }, [selectedCustomer, startDate, endDate])

  // Update data when filters change
  useEffect(() => {
    if (startDate && endDate) {
      updateData()
    }
  }, [selectedCustomer, startDate, endDate, updateData])

  // Initialize with default data
  useEffect(() => {
    // Set default period to last 30 days on initial load
    const option = periodOptions.find((opt) => opt.value === "last30days")
    if (option) {
      const { startDate: start, endDate: end } = option.getDateRange()
      if (start) setStartDate(format(start, "yyyy-MM-dd"))
      if (end) setEndDate(format(end, "yyyy-MM-dd"))
    }
  }, [periodOptions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Prepare data for the progress chart
  const progressData = [
    { name: "Completed", value: metrics.completedOrders },
    { name: "In Progress", value: metrics.inProgressOrders },
  ]

  // Function to handle generating the report
  const handleGenerateReport = () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer to generate a report",
        variant: "destructive",
      })
      return
    }

    // Show loading toast
    toast({
      title: "Generating Report",
      description: "Please wait while we prepare your report...",
    })

    // Navigate to the report page with query parameters
    router.push(
      `/customer-summary/report?customerId=${encodeURIComponent(selectedCustomer)}&customerName=${encodeURIComponent(selectedCustomer)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header with Filters */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Customer Summary</h1>
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[200px]">
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
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
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
            </div>

            {showCustomDateRange && (
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
                <span className="text-muted-foreground mb-2">to</span>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[150px]"
                  />
                </div>
              </div>
            )}

            {/* Add Generate Report button here */}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                onClick={handleGenerateReport}
                disabled={!selectedCustomer || isLoading}
              >
                Generate Report
              </Button>
            </div>

            <div className="ml-auto">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Banknote className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Activity className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{metrics.orderCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Clock className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total VAT</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalVAT)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Customs</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalCustomsDuties)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Order Progress */}
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

              {/* Monthly Order Trend */}
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

              {/* Recent Orders */}
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
                          <p className="font-medium">{order.poNumber}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(order.createdAt), "MMM dd, yyyy")}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                order.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">{order.freightType}</p>
                        </div>
                      </div>
                    ))}
                    {recentOrders.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No recent orders</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              {selectedCustomer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customers
                      .filter((c) => c.name === selectedCustomer)
                      .map((customer) => (
                        <div key={customer.id} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                              <p>{customer.contactPerson}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Email</p>
                              <p>{customer.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Phone</p>
                              <p>{customer.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">VAT Number</p>
                              <p>{customer.vatNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Importer's Code</p>
                              <p>{customer.importersCode}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Customer Since</p>
                              <p>{format(parseISO(customer.createdAt), "MMMM yyyy")}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p>
                              {customer.address.street}, {customer.address.city}, {customer.address.postalCode}
                            </p>
                            <p>{customer.address.country}</p>
                          </div>
                        </div>
                      ))}
                    {!customers.some((c) => c.name === selectedCustomer) && (
                      <p className="text-muted-foreground text-center py-4">Customer details not found</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer ? `Orders for ${selectedCustomer}` : "All orders"} •
                    {startDate && endDate
                      ? ` ${format(new Date(startDate), "MMM dd, yyyy")} to ${format(new Date(endDate), "MMM dd, yyyy")}`
                      : ""}
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
                          <th className="p-2 text-left font-medium">Status</th>
                          <th className="p-2 text-right font-medium">Order Value</th>
                          <th className="p-2 text-right font-medium">VAT</th>
                          <th className="p-2 text-right font-medium">Customs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">{order.poNumber}</td>
                            <td className="p-2">{format(parseISO(order.createdAt), "MMM dd, yyyy")}</td>
                            <td className="p-2">{order.importer}</td>
                            <td className="p-2">{order.freightType}</td>
                            <td className="p-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  order.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="p-2 text-right">{formatCurrency(order.totalValue)}</td>
                            <td className="p-2 text-right">{formatCurrency(order.totalValue * 0.15)}</td>
                            <td className="p-2 text-right">{formatCurrency(order.totalValue * 0.2)}</td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-muted-foreground">
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
          </>
        )}
      </div>
    </div>
  )
}
