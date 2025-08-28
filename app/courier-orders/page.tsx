"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/lib/toast"
import { ArrowLeft, Eye, RefreshCw, Search } from "lucide-react"

interface CourierOrder {
  id: string
  waybill_no: string
  sender: string
  receiver: string
  created_at: string
  status: string
  service_type: string
  total_weight?: number
  po_number?: string
}

export default function CourierOrdersPage() {
  const router = useRouter()
  const [courierOrders, setCourierOrders] = useState<CourierOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<CourierOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourierOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, courierOrders])

  const fetchCourierOrders = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching courier orders from API route...")

      const response = await fetch("/api/courier-orders")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Courier orders API response:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      setCourierOrders(data.data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching courier orders:", error)
      toast.error("Failed to load courier orders")
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = courierOrders

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.waybill_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gray-500"
      case "dispatched":
        return "bg-blue-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-ZA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date)
  }

  const formatWeight = (weight?: number) => {
    if (!weight) return "N/A"
    return `${weight} kg`
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleRefresh = () => {
    fetchCourierOrders()
    toast.success("Courier orders refreshed")
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/courier-orders/details/${orderId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Courier Orders</h1>
            <p className="text-muted-foreground">View and manage all courier orders</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading courier orders...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Courier Orders</h1>
          <p className="text-muted-foreground">View and manage all courier orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/courier-orders/new")} className="bg-black text-white hover:bg-gray-800">
            Create Order
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Filters and Controls Row */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Weight</TableHead>
                  <TableHead>Delivery Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-lg font-medium">No courier orders found</p>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Create your first courier order to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{order.waybill_no}</TableCell>
                      <TableCell>{order.sender}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} text-white`}>
                          {capitalizeFirst(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatWeight(order.total_weight)}</TableCell>
                      <TableCell>{capitalizeFirst(order.service_type || "Standard")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="hover:bg-muted"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          {filteredOrders.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {courierOrders.length} courier orders
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
