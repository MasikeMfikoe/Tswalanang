"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Eye, RefreshCw, Search } from "lucide-react"

// Define the Order type to match Supabase data
type Order = {
  id: string
  order_number?: string
  po_number?: string
  supplier?: string
  importer?: string
  status?: string
  cargo_status?: string
  freight_type?: string
  total_value?: number
  customer_name?: string
  origin?: string
  destination?: string
  created_at: string
  updated_at?: string
}

export function OrdersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      console.log("Fetched orders from Supabase:", data)
      setOrders(data || [])

      if (data && data.length === 0) {
        toast({
          title: "No Orders Found",
          description: "No orders have been created yet. Create your first order!",
        })
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      setError(error.message || "Failed to fetch orders")
      toast({
        title: "Error",
        description: "Failed to load orders from database",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize component and fetch orders
  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders whenever search term, status filter, or orders change
  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const filterOrders = () => {
    let filtered = orders

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.importer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.destination?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status?.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredOrders(filtered)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-ZA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date)
  }

  // Get badge variant based on status
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-500"

    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "in progress":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleRefresh = () => {
    fetchOrders()
    toast({
      title: "Success",
      description: "Orders refreshed successfully",
    })
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Shipment Orders</h1>
            <p className="text-muted-foreground">View and manage all shipment orders</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading shipment orders...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">All Shipment Orders</h1>
          <p className="text-muted-foreground">View and manage all shipment orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/create-order")} className="bg-black text-white hover:bg-gray-800">
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
        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Error loading orders</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Filters and Controls Row */}
          <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Origin → Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-lg font-medium">No shipment orders found</p>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Create your first shipment order to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{order.order_number || order.po_number || order.id}</TableCell>
                      <TableCell>{order.po_number || order.order_number || "N/A"}</TableCell>
                      <TableCell>{order.customer_name || order.importer || "N/A"}</TableCell>
                      <TableCell>
                        {order.origin && order.destination
                          ? `${order.origin} → ${order.destination}`
                          : order.origin || order.destination || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} text-white`}>
                          {order.status ? capitalizeFirst(order.status) : "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
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
              Showing {filteredOrders.length} of {orders.length} shipment orders
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
