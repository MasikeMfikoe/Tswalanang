"use client"

/**
 * Full client-side implementation of the Client-Portal Orders page.
 * (This is the exact code you already had – just moved into its own file so the
 *   route segment stays a tiny server component and avoids the broken chunk.)
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, DollarSign, Filter, Package, Search } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabaseClient" // Import supabase

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA
//  (Replace with real API integration when available)
// ─────────────────────────────────────────────────────────────────────────
const mockClientOrders = [
  {
    id: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    status: "In Progress",
    cargoStatus: "in-transit",
    freightType: "Sea Freight",
    totalValue: 25000,
    createdAt: "2024-01-15",
    estimatedDelivery: "2024-02-15",
    supplier: "Global Electronics Ltd",
    destination: "Cape Town, South Africa",
    vesselName: "MSC Pamela",
    etaAtPort: "2024-02-10",
  },
  {
    id: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    status: "Completed",
    cargoStatus: "delivered",
    freightType: "Air Freight",
    totalValue: 15000,
    createdAt: "2024-01-10",
    estimatedDelivery: "2024-01-25",
    supplier: "Tech Components Inc",
    destination: "Johannesburg, South Africa",
    vesselName: "N/A",
    etaAtPort: "2024-01-20",
  },
  {
    id: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    status: "Pending",
    cargoStatus: "at-origin",
    freightType: "Sea Freight",
    totalValue: 35000,
    createdAt: "2024-01-20",
    estimatedDelivery: "2024-03-01",
    supplier: "Industrial Supplies Co",
    destination: "Durban, South Africa",
    vesselName: "Maersk Seletar",
    etaAtPort: "2024-02-25",
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getCargoStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "in-transit":
      return "bg-blue-100 text-blue-800"
    case "at-origin":
      return "bg-orange-100 text-orange-800"
    case "at-destination":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCargoStatus = (status: string) =>
  status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState(mockClientOrders)
  const [filteredOrders, setFilteredOrders] = useState(mockClientOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [freightFilter, setFreightFilter] = useState("all")

  // ─── Data Fetching and Realtime Subscription ─────────────────────────
  useEffect(() => {
    if (!user?.id) {
      // If no user, use mock data and return
      setOrders(mockClientOrders)
      setFilteredOrders(mockClientOrders)
      return
    }

    const fetchOrders = async () => {
      try {
        const ordersResponse = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          if (ordersData.success) {
            setOrders(ordersData.data.orders)
          } else {
            console.warn("Failed to fetch orders, using fallback data:", ordersData.error)
            setOrders(mockClientOrders)
          }
        } else {
          console.warn("Failed to fetch orders, using fallback data (HTTP error):", ordersResponse.status)
          setOrders(mockClientOrders)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders(mockClientOrders)
      }
    }

    fetchOrders() // Initial fetch

    // Set up Realtime subscription
    const ordersChannel = supabase
      .channel("client_orders_list_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        console.log("Order change received for list!", payload)
        // Re-fetch orders when a change occurs
        fetchOrders()
      })
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  // ─── Filtering logic ────────────────────────────────────────────────
  useEffect(() => {
    let next = orders

    if (searchTerm) {
      next = next.filter(
        (
          o: any, // Added any type for o to avoid TS error with dynamic properties
        ) =>
          o.po_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) || // Use po_number from actual data
          o.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.destination?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      next = next.filter((o: any) => o.status?.toLowerCase() === statusFilter)
    }
    if (freightFilter !== "all") {
      next = next.filter((o: any) => o.freight_type?.toLowerCase() === freightFilter) // Use freight_type
    }
    setFilteredOrders(next)
  }, [searchTerm, statusFilter, freightFilter, orders])

  const isAdmin = user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Admin View – Client Orders</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "Admin View – Client Orders" : `${user?.department || "Company"} Orders`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client orders" : `Welcome ${user?.department || "Company"}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/client-portal")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search PO, supplier or destination…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In-Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freightFilter} onValueChange={setFreightFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by freight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Freight Types</SelectItem>
                  <SelectItem value="sea freight">Sea Freight</SelectItem>
                  <SelectItem value="air freight">Air Freight</SelectItem>
                  <SelectItem value="exw">EXW</SelectItem>
                  <SelectItem value="fob">FOB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick summary cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Your recent order activity</p>
              <div className="space-y-2 text-sm">
                {/* This section would ideally be populated by actual recent activity from the database */}
                <div>
                  <span className="font-medium">PO-ABC-001</span> – Status updated
                </div>
                <div>
                  <span className="font-medium">PO-ABC-002</span> – Delivered
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <span className="font-medium text-blue-600">
                    {orders.filter((o: any) => o.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">
                    {orders.filter((o: any) => o.status === "Completed").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
            <CardDescription>
              {filteredOrders.length} of {orders.length} orders shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Freight Type</TableHead>
                      <TableHead>Vessel Name</TableHead>
                      <TableHead>Cargo Status</TableHead>
                      <TableHead>ETA at Port</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(
                      (
                        o: any, // Added any type for o
                      ) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.po_number}</TableCell> {/* Use po_number */}
                          <TableCell>{o.supplier}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(o.status)}>{o.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell> {/* Use created_at */}
                          <TableCell>{o.freight_type}</TableCell> {/* Use freight_type */}
                          <TableCell>{o.vessel_name}</TableCell> {/* Use vessel_name */}
                          <TableCell>
                            <Badge className={getCargoStatusColor(o.cargo_status)}>
                              {" "}
                              {/* Use cargo_status */}
                              {formatCargoStatus(o.cargo_status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(o.eta_at_port).toLocaleDateString()}</TableCell> {/* Use eta_at_port */}
                          <TableCell>{new Date(o.estimated_delivery).toLocaleDateString()}</TableCell>{" "}
                          {/* Use estimated_delivery */}
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
