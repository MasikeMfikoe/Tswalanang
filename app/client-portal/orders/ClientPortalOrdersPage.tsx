"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Package, Search, Filter, ChevronDown, RefreshCcw } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { supabase } from "@/lib/supabaseClient"
import { formatDate } from "@/lib/utils" // Import the new utility

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockOrders = [
  {
    id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    status: "In Progress",
    cargo_status: "in-transit",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-02-15T10:00:00Z",
    total_value: 25000,
    customer_name: "ABC Company",
  },
  {
    id: "ORD-2024-002",
    po_number: "PO-ABC-002",
    status: "Completed",
    cargo_status: "delivered",
    freight_type: "Air Freight",
    estimated_delivery: "2024-01-25T14:30:00Z",
    total_value: 15000,
    customer_name: "ABC Company",
  },
  {
    id: "ORD-2024-003",
    po_number: "PO-ABC-003",
    status: "Pending",
    cargo_status: "at-origin",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-03-01T09:00:00Z",
    total_value: 35000,
    customer_name: "ABC Company",
  },
  {
    id: "ORD-2024-004",
    po_number: "PO-XYZ-001",
    status: "In Progress",
    cargo_status: "in-transit",
    freight_type: "Road Freight",
    estimated_delivery: "2024-02-20T11:00:00Z",
    total_value: 12000,
    customer_name: "XYZ Corp",
  },
  {
    id: "ORD-2024-005",
    po_number: "PO-XYZ-002",
    status: "Completed",
    cargo_status: "delivered",
    freight_type: "Rail Freight",
    estimated_delivery: "2024-01-30T16:00:00Z",
    total_value: 18000,
    customer_name: "XYZ Corp",
  },
  {
    id: "ORD-2024-006",
    po_number: "PO-LMN-001",
    status: "Cancelled",
    cargo_status: "cancelled",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-02-10T08:00:00Z",
    total_value: 5000,
    customer_name: "LMN Logistics",
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
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
    case "loading":
      return "bg-indigo-100 text-indigo-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCargoStatus = (status: string | null | undefined) => {
  if (!status) {
    return "N/A"
  }
  return status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalOrdersPage() {
  const { user, isLoading: isUserLoading } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // You can make this configurable
  const [isLoading, setIsLoading] = useState(false) // Declare the isLoading variable

  const fetchOrders = async () => {
    setIsLoading(true) // Set isLoading to true before fetching orders
    if (!user?.id) {
      setOrders(mockOrders.filter((order) => order.customer_name === "ABC Company")) // Filter mock orders for a specific client
      setIsLoadingData(false)
      setIsLoading(false) // Set isLoading to false after fetching orders
      return
    }

    setIsLoadingData(true)
    setError(null)
    try {
      const response = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      if (data.success) {
        setOrders(data.data.orders || [])
      } else {
        console.warn("API returned success: false, using mock data.", data.error)
        setOrders(mockOrders.filter((order) => order.customer_name === "ABC Company"))
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders.")
      setOrders(mockOrders.filter((order) => order.customer_name === "ABC Company")) // Fallback to mock data on error
    } finally {
      setIsLoadingData(false)
      setIsLoading(false) // Set isLoading to false after fetching orders
    }
  }

  useEffect(() => {
    fetchOrders()

    // Set up Realtime subscriptions
    const ordersChannel = supabase
      .channel("client_portal_orders_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        console.log("Realtime order change received for client portal orders page!", payload)
        fetchOrders() // Re-fetch data on any order change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(mockOrders.map((order) => order.status))
    return Array.from(statuses)
  }, [])

  const uniqueFreightTypes = useMemo(() => {
    const freightTypes = new Set(mockOrders.map((order) => order.freight_type))
    return Array.from(freightTypes)
  }, [])

  const filteredOrders = useMemo(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus) {
      filtered = filtered.filter((order) => order.status.toLowerCase() === filterStatus.toLowerCase())
    }

    return filtered
  }, [orders, searchTerm, filterStatus])

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchOrders}>Retry</Button>
      </div>
    )
  }

  // Redirect if not a client or guest user
  if (!user || (user.role !== "client" && user.role !== "guest" && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">You don't have permission to access this page.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" /> Your Orders
            </CardTitle>
            <CardDescription>View and manage all your logistics orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by PO number or status..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      {filterStatus ? `Status: ${filterStatus}` : "Filter by Status"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterStatus(null)}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("In Progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Completed")}>Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Cancelled")}>Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={fetchOrders} variant="outline" size="icon" title="Refresh Orders">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {currentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No orders found matching your criteria.
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus(null)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cargo Status</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.po_number}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCargoStatusColor(order.cargo_status)}>
                              {formatCargoStatus(order.cargo_status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.freight_type}</TableCell>
                          <TableCell>{formatDate(order.estimated_delivery)}</TableCell>
                          <TableCell className="text-right">R {order.total_value?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
