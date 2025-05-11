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

// Define the Order type to avoid TypeScript errors
type Order = {
  id: string
  customerName: string
  status: string
  totalValue: number
  createdAt: string
  poNumber: string
  supplier: string
  importer: string
}

// Direct sample data definition - not in a function
const SAMPLE_ORDERS: Order[] = [
  {
    id: "PO-2024-001",
    customerName: "Acme Corporation",
    status: "Completed",
    totalValue: 12500,
    createdAt: "2024-01-15T10:30:00Z",
    poNumber: "PO001",
    supplier: "Supplier A",
    importer: "Acme Corp",
  },
  {
    id: "PO-2024-002",
    customerName: "Global Enterprises",
    status: "In Progress",
    totalValue: 8750,
    createdAt: "2024-01-20T14:45:00Z",
    poNumber: "PO002",
    supplier: "Supplier B",
    importer: "Global Traders",
  },
  {
    id: "PO-2024-003",
    customerName: "Tech Solutions",
    status: "Pending",
    totalValue: 15000,
    createdAt: "2024-01-25T09:15:00Z",
    poNumber: "PO003",
    supplier: "Supplier C",
    importer: "Tech Innovators",
  },
  {
    id: "PO-2024-004",
    customerName: "Logistics Pro",
    status: "Cancelled",
    totalValue: 5250,
    createdAt: "2024-01-28T16:20:00Z",
    poNumber: "PO004",
    supplier: "Supplier D",
    importer: "Logistics Pro",
  },
  {
    id: "PO-2024-005",
    customerName: "Acme Corporation",
    status: "Completed",
    totalValue: 9800,
    createdAt: "2024-02-01T11:10:00Z",
    poNumber: "PO005",
    supplier: "Supplier E",
    importer: "Acme Corp",
  },
  {
    id: "PO-2024-006",
    customerName: "Global Enterprises",
    status: "In Progress",
    totalValue: 11200,
    createdAt: "2024-02-05T13:30:00Z",
    poNumber: "PO006",
    supplier: "Supplier F",
    importer: "Global Traders",
  },
  {
    id: "PO-2024-007",
    customerName: "Tech Solutions",
    status: "Pending",
    totalValue: 7500,
    createdAt: "2024-02-10T10:45:00Z",
    poNumber: "PO007",
    supplier: "Supplier G",
    importer: "Tech Innovators",
  },
  {
    id: "PO-2024-008",
    customerName: "Logistics Pro",
    status: "Completed",
    totalValue: 18900,
    createdAt: "2024-02-15T09:20:00Z",
    poNumber: "PO008",
    supplier: "Supplier H",
    importer: "Logistics Pro",
  },
  {
    id: "PO-2024-009",
    customerName: "Acme Corporation",
    status: "In Progress",
    totalValue: 14500,
    createdAt: "2024-02-20T15:15:00Z",
    poNumber: "PO009",
    supplier: "Supplier I",
    importer: "Acme Corp",
  },
  {
    id: "PO-2024-010",
    customerName: "Global Enterprises",
    status: "Cancelled",
    totalValue: 6300,
    createdAt: "2024-02-25T14:10:00Z",
    poNumber: "PO010",
    supplier: "Supplier J",
    importer: "Global Traders",
  },
  {
    id: "PO-2024-011",
    customerName: "Tech Solutions",
    status: "Completed",
    totalValue: 21000,
    createdAt: "2024-03-01T08:30:00Z",
    poNumber: "PO011",
    supplier: "Supplier K",
    importer: "Tech Innovators",
  },
  {
    id: "PO-2024-012",
    customerName: "Logistics Pro",
    status: "Pending",
    totalValue: 9750,
    createdAt: "2024-03-05T11:45:00Z",
    poNumber: "PO012",
    supplier: "Supplier L",
    importer: "Logistics Pro",
  },
  {
    id: "PO-2024-013",
    customerName: "Acme Corporation",
    status: "In Progress",
    totalValue: 16800,
    createdAt: "2024-03-10T13:20:00Z",
    poNumber: "PO013",
    supplier: "Supplier M",
    importer: "Acme Corp",
  },
  {
    id: "PO-2024-014",
    customerName: "Global Enterprises",
    status: "Completed",
    totalValue: 11900,
    createdAt: "2024-03-15T10:10:00Z",
    poNumber: "PO014",
    supplier: "Supplier N",
    importer: "Global Traders",
  },
  {
    id: "PO-2024-015",
    customerName: "Tech Solutions",
    status: "Cancelled",
    totalValue: 8200,
    createdAt: "2024-03-20T09:45:00Z",
    poNumber: "PO015",
    supplier: "Supplier O",
    importer: "Tech Innovators",
  },
]

export function OrdersContent() {
  console.log("OrdersContent component rendering")

  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(SAMPLE_ORDERS)
  const [isLoading, setIsLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(false)

  // Initialize component and show notification
  useEffect(() => {
    console.log("Component mounted")

    // Short timeout to simulate loading and ensure component is fully mounted
    setTimeout(() => {
      setIsLoading(false)
      setShowNotification(true)

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }, 500)

    // Log the sample data to console for debugging
    console.log("Sample orders:", SAMPLE_ORDERS)
  }, [])

  // Filter orders whenever search term or status filter changes
  useEffect(() => {
    console.log("Filtering orders with:", { searchTerm, statusFilter })

    const filtered = SAMPLE_ORDERS.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.poNumber.toLowerCase().includes(searchLower) ||
          order.supplier.toLowerCase().includes(searchLower) ||
          order.importer.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    console.log("Filtered orders count:", filtered.length)
    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 text-white">{status}</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 text-white">{status}</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500 text-black">{status}</Badge>
      case "Cancelled":
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
      {/* In-component notification instead of toast */}
      {showNotification && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-md flex justify-between items-center">
          <div>
            <p className="font-semibold">Sample Data</p>
            <p className="text-sm">Displaying sample order data for demonstration purposes</p>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-blue-800 hover:text-blue-600">
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipment Order Management</h1>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Link href="/create-order">
            <Button>Create New Order</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Shipment Orders</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search orders by ID, PO number, supplier..."
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
          {isLoading ? (
            renderSkeleton()
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.poNumber}</TableCell>
                      <TableCell>{order.importer}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found. Try adjusting your search or filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredOrders.length === 0 && SAMPLE_ORDERS.length > 0 && (
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
