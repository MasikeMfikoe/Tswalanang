"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { Ship, Download, FileText } from "lucide-react"
import { BarChart } from "@/components/Charts"
import { toast } from "@/lib/toast"
import CargoStatusTab from "@/components/CargoStatusTab"
import { exportToCSV } from "@/lib/exportToCSV" // Import handleExport function
import type { Order } from "@/types/models"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

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
  vessel_name?: string
}

interface OrderWithTracking extends Order {
  trackingData?: TrackingData
}

const fetcher = async (url: string) => {
  console.log(`[v0] SWR: Fetching from ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || "API request failed")
  }
  return result
}

export default function CustomerSummary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30days")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<OrderWithTracking[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderWithTracking[]>([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalVAT: 0,
    totalCustomsDuties: 0,
    orderCount: 0,
    completedOrders: 0,
    inProgressOrders: 0,
  })
  const [monthlyOrderData, setMonthlyOrderData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [showStatusReport, setShowStatusReport] = useState<boolean>(false)
  const [ordersData, setOrdersData] = useState<any>(null)
  const [ordersError, setOrdersError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { data: customersData, error: customersError } = useSWR("/api/customers", fetcher)
  const customers = customersData?.data || []

  const ordersApiUrl = useCallback(() => {
    if (!startDate || !endDate) return null

    const params = new URLSearchParams()
    params.append("from", startDate)
    params.append("to", endDate)
    params.append("excludeStatus", "cancelled,draft")
    params.append("include", "etd,eta,cargo_status")

    return `/api/orders?${params.toString()}`
  }, [startDate, endDate])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    updateURL(undefined, undefined, undefined, value)
  }

  const periodOptions: PeriodOption[] = [
    {
      label: "Last 7 days",
      value: "last7days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { startDate, endDate }
      },
    },
    {
      label: "Last 30 days",
      value: "last30days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        return { startDate, endDate }
      },
    },
    {
      label: "Last 90 days",
      value: "last90days",
      getDateRange: () => {
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
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

  const handlePeriodChange = (value: string) => {
    console.log(`[v0] Period changed to: ${value}`)
    setSelectedPeriod(value)
    const selectedOption = periodOptions.find((option) => option.value === value)

    if (selectedOption) {
      if (value === "custom") {
        setShowCustomDateRange(true)
      } else {
        setShowCustomDateRange(false)
        const { startDate: start, endDate: end } = selectedOption.getDateRange()
        if (start && end) {
          const startDateStr = start.toISOString().split("T")[0]
          const endDateStr = end.toISOString().split("T")[0]
          console.log(`[v0] Setting date range: ${startDateStr} to ${endDateStr}`)
          setStartDate(startDateStr)
          setEndDate(endDateStr)
          updateURL(selectedCustomer, startDateStr, endDateStr)
        }
      }
    }
  }

  const updateURL = useCallback(
    (customerId?: string, from?: string, to?: string, tab?: string) => {
      const params = new URLSearchParams()

      if (tab) {
        params.set("tab", tab)
      }

      if (customerId && customerId !== "all") {
        params.set("customerId", customerId)
      }

      if (from) {
        params.set("from", from)
      }

      if (to) {
        params.set("to", to)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `/customer-summary?${queryString}` : "/customer-summary"

      router.replace(newUrl, { scroll: false })
    },
    [router],
  )

  const fetchTrackingData = async (trackingNumber: string): Promise<TrackingData | null> => {
    try {
      console.log(`[v0] Attempting to fetch tracking data for: ${trackingNumber}`)

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

      if (!response.ok) {
        console.log(`[v0] Tracking API failed for ${trackingNumber}: ${response.status}`)
        return null
      }

      const result = await response.json()

      if (result.success && result.data) {
        console.log(`[v0] Successfully fetched tracking data for: ${trackingNumber}`)
        return {
          estimatedArrival: result.data.estimatedArrival,
          estimatedDeparture: result.data.estimatedDeparture,
          actualArrival: result.data.actualArrival,
          actualDeparture: result.data.actualDeparture,
          currentStatus: result.data.currentStatus,
          demurrageDays: result.data.demurrageDays,
          vessel_name: result.data.vessel_name,
        }
      }
    } catch (error) {
      console.log(`[v0] Tracking API error for ${trackingNumber}:`, error)
    }
    return null
  }

  const enrichOrdersWithTracking = async (orders: Order[]): Promise<OrderWithTracking[]> => {
    console.log(`[v0] Processing ${orders.length} orders without tracking enrichment`)
    return orders.map((order) => ({ ...order }))
  }

  useEffect(() => {
    console.log("[v0] Initializing from URL parameters")
    const customerId = searchParams.get("customerId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const tabParam = searchParams.get("tab")

    if (customerId) {
      setSelectedCustomer(customerId)
    }

    if (tabParam) {
      setActiveTab(tabParam)
    }

    if (from && to && from !== "0002-08-13" && to !== "2025-09-12") {
      console.log(`[v0] Setting dates from URL: ${from} to ${to}`)
      setStartDate(from)
      setEndDate(to)
      setSelectedPeriod("custom")
      setShowCustomDateRange(true)
    } else {
      console.log("[v0] Setting default period: last30days")
      const defaultPeriod = periodOptions.find((option) => option.value === "last30days")
      if (defaultPeriod) {
        const { startDate: start, endDate: end } = defaultPeriod.getDateRange()
        if (start && end) {
          setStartDate(start.toISOString().split("T")[0])
          setEndDate(end.toISOString().split("T")[0])
        }
      }
    }
  }, []) // Remove searchParams dependency to prevent loops

  useEffect(() => {
    if (startDate && endDate && startDate !== "0002-08-13") {
      console.log(`[v0] Updating URL with dates: ${startDate} to ${endDate}`)
    }
  }, [selectedCustomer, startDate, endDate]) // Removed updateURL from dependencies to prevent infinite loop

  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      updateURL(selectedCustomer, startDate, endDate)
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

  const handleExport = useCallback(async () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No Data",
        description: "No orders to export for the selected criteria.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      const selectedCustomerName = customers.find((c) => c.id === selectedCustomer)?.name || "AllCustomers"
      const filename = `orders_${selectedCustomerName}_${startDate}_to_${endDate}.csv`

      await exportToCSV(filteredOrders, filename, user?.role)

      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredOrders.length} orders to ${filename}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }, [filteredOrders, customers, selectedCustomer, startDate, endDate, user?.role])

  const handleStatusReportExport = useCallback(async () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No Data",
        description: "No orders to export for the selected customer.",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedCustomerName = customers.find((c) => c.id === selectedCustomer)?.name || "AllCustomers"
      const filename = `status_report_${selectedCustomerName}_${new Date().toISOString().split("T")[0]}.csv`

      const statusReportData = filteredOrders.map((order) => {
        const vesselName = order.trackingData?.vessel_name || order.vessel_name || order.vessel || ""

        let masterBill = ""
        let containerNumber = ""

        if (order.tracking_number) {
          const containerPattern = /^[A-Z]{4}\d{7}$/
          const bolPattern = /^[A-Z0-9]{8,20}$/

          if (containerPattern.test(order.tracking_number)) {
            containerNumber = order.tracking_number
          } else if (bolPattern.test(order.tracking_number) && !containerPattern.test(order.tracking_number)) {
            masterBill = order.tracking_number
          }
        }

        if (order.container_number) {
          containerNumber = order.container_number
        }
        if (order.master_bill || order.bill_of_lading) {
          masterBill = order.master_bill || order.bill_of_lading || ""
        }

        return {
          "PO/Invoice No.": order.po_number || "N/A",
          "SS P/N.": "",
          Supplier: order.supplier || "N/A",
          Consignee: order.importer || "N/A",
          ETD: order.etd ? format(parseISO(order.etd), "yyyy-MM-dd") : "TBD",
          "Original ETA": order.eta ? format(parseISO(order.eta), "yyyy-MM-dd") : "TBD",
          "New ETA": order.trackingData?.estimatedArrival
            ? format(parseISO(order.trackingData.estimatedArrival), "yyyy-MM-dd")
            : "TBD",
          Origin: order.origin || order.origin_port || "N/A",
          Volume: order.volume || order.volume_cbm || "N/A",
          Commodity: order.commodity || "N/A",
          "Vessel Details": vesselName || "N/A",
          "Master Bill": masterBill || "N/A",
          "Container No.": containerNumber || "N/A",
          Status: order.status || "N/A",
          "Cargo Status": order.cargo_status || "N/A",
        }
      })

      const headers = Object.keys(statusReportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...statusReportData.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Downloaded status report for ${filteredOrders.length} orders`,
      })
    } catch (error) {
      console.error("Status report export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export status report. Please try again.",
        variant: "destructive",
      })
    }
  }, [filteredOrders, customers, selectedCustomer])

  useEffect(() => {
    if (!ordersData?.data) {
      setFilteredOrders([])
      setRecentOrders([])
      setMetrics({
        totalRevenue: 0,
        totalVAT: 0,
        totalCustomsDuties: 0,
        orderCount: 0,
        completedOrders: 0,
        inProgressOrders: 0,
      })
      setMonthlyOrderData([])
      return
    }

    const processOrdersData = async () => {
      try {
        const orders = ordersData.data || []
        console.log("[v0] Customer Summary: Processing orders data:", orders.length)

        let filteredByCustomer = orders
        if (selectedCustomer && selectedCustomer !== "all") {
          const selectedCustomerName = customers.find((c) => c.id === selectedCustomer)?.name?.toLowerCase() || ""
          if (selectedCustomerName) {
            filteredByCustomer = orders.filter(
              (order: Order) =>
                order.importer?.toLowerCase().includes(selectedCustomerName) ||
                order.customer_name?.toLowerCase().includes(selectedCustomerName),
            )
          }
        }

        const enrichedOrders = await enrichOrdersWithTracking(filteredByCustomer)
        setFilteredOrders(enrichedOrders)

        const totalRevenue = enrichedOrders?.reduce((sum, order) => sum + (order.value || 0), 0) || 0
        const totalVAT = totalRevenue * 0.15
        const totalCustomsDuties = totalRevenue * 0.2
        const orderCount = enrichedOrders?.length || 0
        const completedOrders = enrichedOrders?.filter((order) => order.status === "Completed").length || 0
        const inProgressOrders = orderCount - completedOrders

        console.log("[v0] Customer Summary: Total revenue calculation:", totalRevenue)

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
        console.error("[v0] Customer Summary: Error processing orders data:", error)
        toast({
          title: "Error",
          description: "Failed to process order data. Please try again.",
          variant: "destructive",
        })
      }
    }

    processOrdersData()
  }, [ordersData, selectedCustomer, customers, startDate, endDate])

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const url = ordersApiUrl()
        if (url) {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || "API request failed")
          }
          setOrdersData(result)
        } else {
          setOrdersData(null)
        }
      } catch (error) {
        setOrdersError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [ordersApiUrl])

  if (customersError) {
    console.error("[v0] Customer Summary: Error loading customers:", customersError)
  }

  if (ordersError) {
    console.error("[v0] Customer Summary: Error loading orders:", ordersError)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

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

  const getCargoStatusBadge = (status: string | null) => {
    if (!status) {
      return {
        label: "Unknown",
        className: "bg-gray-100 text-gray-800 border-gray-300",
      }
    }

    // Normalize status for matching - convert to lowercase and trim
    const normalizeStatus = (str: string) => {
      return str.toLowerCase().trim()
    }

    const normalizedStatus = normalizeStatus(status)

    const statusMap = {
      "instruction-sent": {
        label: "Instruction Sent to Agent",
        className: "border",
        style: { backgroundColor: "#FEE2E2", color: "#991B1B", borderColor: "#FCA5A5" },
      },
      "agent-response": {
        label: "Agent Response",
        className: "border",
        style: { backgroundColor: "#EF4444", color: "#7F1D1D", borderColor: "#F87171" },
      },
      "at-origin": {
        label: "At Origin",
        className: "border",
        style: { backgroundColor: "#DBEAFE", color: "#1E3A8A", borderColor: "#93C5FD" },
      },
      "cargo-departed": {
        label: "Cargo Departed",
        className: "border",
        style: { backgroundColor: "#3B82F6", color: "#1E40AF", borderColor: "#60A5FA" },
      },
      "in-transit": {
        label: "In Transit",
        className: "border",
        style: { backgroundColor: "#F59E0B", color: "#7C2D12", borderColor: "#FDBA74" },
      },
      "at-destination": {
        label: "At Destination",
        className: "border",
        style: { backgroundColor: "#D1FAE5", color: "#065F46", borderColor: "#86EFAC" },
      },
      delivered: {
        label: "Delivered",
        className: "border",
        style: { backgroundColor: "#10B981", color: "#064E3B", borderColor: "#34D399" },
      },
    }

    return (
      statusMap[normalizedStatus] || {
        label: status,
        className: "bg-gray-100 text-gray-800 border-gray-300",
      }
    )
  }

  const formatETDETA = (dateString: string | null) => {
    if (!dateString) return "—"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "—"

      const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0

      if (hasTime) {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      } else {
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      }
    } catch (error) {
      return "—"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Summary</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Select
          value={selectedCustomer}
          onValueChange={(value) => {
            setSelectedCustomer(value)
            updateURL(value, startDate, endDate)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
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
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cargo-status" className="flex items-center">
              <Ship className="h-4 w-4 mr-2" />
              Cargo Status
            </TabsTrigger>
          </TabsList>

          <Dialog open={showStatusReport} onOpenChange={setShowStatusReport}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                disabled={!selectedCustomer || selectedCustomer === "all" || filteredOrders.length === 0}
              >
                <FileText className="h-4 w-4" />
                Status Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Status Report - {customers.find((c) => c.id === selectedCustomer)?.name || "Customer"}</span>
                  <Button onClick={handleStatusReportExport} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium min-w-[150px]">Customer</th>
                          <th className="p-2 text-left font-medium min-w-[150px]">Freight Type</th>
                          <th className="p-2 text-left font-medium min-w-[160px]">ETD / ETA</th>
                          <th className="p-2 text-left font-medium min-w-[120px]">Status</th>
                          {user?.role !== "employee" && (
                            <th className="p-2 text-right font-medium min-w-[120px]">Total Value</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 10).map((order) => {
                          const cargoStatusBadge = getCargoStatusBadge(order.cargo_status)

                          return (
                            <tr key={order.id} className="border-b hover:bg-muted/30">
                              <td className="p-2">{order.importer}</td>
                              <td className="p-2">{order.freight_type || "N/A"}</td>
                              <td className="p-2">
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <div className="text-muted-foreground text-xs font-medium">ETD</div>
                                    <div>{formatETDETA(order.etd)}</div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-muted-foreground text-xs font-medium">ETA</div>
                                    <div>{formatETDETA(order.eta)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2">
                                {cargoStatusBadge.style ? (
                                  <div
                                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    style={cargoStatusBadge.style}
                                  >
                                    {cargoStatusBadge.label}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className={cargoStatusBadge.className}>
                                    {cargoStatusBadge.label}
                                  </Badge>
                                )}
                              </td>
                              {user?.role !== "employee" && (
                                <td className="p-2 text-right">{formatCurrency(order.value || 0)}</td>
                              )}
                            </tr>
                          )
                        })}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td
                              colSpan={user?.role !== "employee" ? 5 : 4}
                              className="p-4 text-center text-muted-foreground"
                            >
                              {selectedCustomer && selectedCustomer !== "all"
                                ? "No orders found for the selected customer and date range"
                                : "No orders found for the selected criteria"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredOrders.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <strong>Total Orders:</strong> {filteredOrders.length} |<strong> Date Range:</strong>{" "}
                      {startDate && endDate
                        ? `${format(parseISO(startDate), "MMM dd, yyyy")} to ${format(parseISO(endDate), "MMM dd, yyyy")}`
                        : "All time"}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <p className="text-sm text-muted-foreground">Past 7 days</p>
                </div>
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
                          <Badge
                            variant="secondary"
                            className={
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      {user?.role !== "employee" && (
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.value || 0)}</p>
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
                  {selectedCustomer && selectedCustomer !== "all" && (
                    <span> • Customer: {customers.find((c) => c.id === selectedCustomer)?.name}</span>
                  )}
                  {startDate && endDate && (
                    <span>
                      {" "}
                      • {format(parseISO(startDate), "MMM dd, yyyy")} to {format(parseISO(endDate), "MMM dd, yyyy")}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredOrders.length === 0 || isExporting}
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Customer</th>
                        <th className="p-2 text-left font-medium">Freight Type</th>
                        <th className="p-2 text-left font-medium min-w-[160px]">ETD / ETA</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        {user?.role !== "employee" && <th className="p-2 text-right font-medium">Total Value</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map((order) => {
                        const cargoStatusBadge = getCargoStatusBadge(order.cargo_status)

                        return (
                          <tr key={order.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">{order.importer}</td>
                            <td className="p-2">{order.freight_type || "N/A"}</td>
                            <td className="p-2">
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <div className="text-muted-foreground text-xs font-medium">ETD</div>
                                  <div>{formatETDETA(order.etd)}</div>
                                </div>
                                <div className="text-sm">
                                  <div className="text-muted-foreground text-xs font-medium">ETA</div>
                                  <div>{formatETDETA(order.eta)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              {cargoStatusBadge.style ? (
                                <div
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  style={cargoStatusBadge.style}
                                >
                                  {cargoStatusBadge.label}
                                </div>
                              ) : (
                                <Badge variant="secondary" className={cargoStatusBadge.className}>
                                  {cargoStatusBadge.label}
                                </Badge>
                              )}
                            </td>
                            {user?.role !== "employee" && (
                              <td className="p-2 text-right">{formatCurrency(order.value || 0)}</td>
                            )}
                          </tr>
                        )
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={user?.role !== "employee" ? 5 : 4}
                            className="p-4 text-center text-muted-foreground"
                          >
                            {selectedCustomer && selectedCustomer !== "all"
                              ? "No orders found for the selected customer and date range"
                              : "No orders found for the selected criteria"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    Showing 10 of {filteredOrders.length} orders. Export to CSV to view all.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cargo-status">
          <CargoStatusTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
