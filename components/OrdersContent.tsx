"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

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
  console.log("OrdersContent component rendering")

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
      // Fallback to empty array
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize component and fetch orders
  useEffect(() => {
    console.log("Component mounted, fetching orders...")
    fetchOrders()
  }, [])

  // Filter orders whenever search term, status filter, or orders change
  useEffect(() => {
    console.log("Filtering orders with:", { searchTerm, statusFilter, ordersCount: orders.length })

    const filtered = orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          order.order_number?.toLowerCase().includes(searchLower) ||
          order.po_number?.toLowerCase().includes(searchLower) ||
          order.customer_name?.toLowerCase().includes(searchLower) ||
          order.supplier?.toLowerCase().includes(searchLower) ||
          order.importer?.toLowerCase().includes(searchLower) ||
          order.origin?.toLowerCase().includes(searchLower) ||
          order.destination?.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    console.log("Filtered orders count:", filtered.length)
    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get badge variant based on status
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>

    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500 text-white">{status}</Badge>
      case "in progress":
        return <Badge className="bg-blue-500 text-white">{status}</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 text-black">{status}</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 text-white">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center p-4 border rounded-lg">
          <Skeleton className="h-6 w-24 mr-4" />
          <Skeleton className="h-6 w-32 mr-4" />
          <Skeleton className="h-6 w-24 mr-4" />
          <Skeleton className="h-6 w-24 mr-4" />
          <Skeleton className="h-6 w-24 ml-auto" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipment Order Management</h1>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh List"}
          </Button>
          <Link href="/create-order">
            <Button>Create New Order</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Shipment Orders ({orders.length} total)</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search orders by PO number, customer, supplier..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Error loading orders</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            renderSkeleton()
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Origin → Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || order.po_number || order.id}</TableCell>
                      <TableCell>{order.po_number || order.order_number || "N/A"}</TableCell>
                      <TableCell>{order.customer_name || order.importer || "N/A"}</TableCell>
                      <TableCell>
                        {order.origin && order.destination
                          ? `${order.origin} → ${order.destination}`
                          : order.origin || order.destination || "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {orders.length === 0 ? (
                        <div className="flex flex-col items-center space-y-2">
                          <p>No orders found in database.</p>
                          <Link href="/create-order">
                            <Button size="sm">Create Your First Order</Button>
                          </Link>
                        </div>
                      ) : (
                        "No orders match your search criteria. Try adjusting your filters."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
            }}
            variant="outline"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
