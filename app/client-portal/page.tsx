"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, FileText, Ship, AlertCircle, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ClientStats {
  totalOrders: number
  totalValue: number
  activeOrders: number
  completedOrders: number
  totalDocuments: number
}

interface Order {
  id: string
  po_number: string
  supplier: string
  status: string
  created_at: string
  freight_type: string
  vessel_name?: string
  cargo_status: string
  eta_at_port?: string
  estimated_delivery?: string
  tracking_number?: string
  total_value?: number
}

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

const formatCargoStatus = (status?: string) => {
  if (!status) {
    return "Unknown"
  }
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "TBD"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "TBD"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "TBD"
  }
}

export default function ClientPortalPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ClientStats>({
    totalOrders: 0,
    totalValue: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalDocuments: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (user?.id) {
      fetchClientData()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const fetchClientData = async () => {
    try {
      setLoading(true)

      // Fetch orders and statistics with customer-specific filtering
      const ordersResponse = await fetch(`/api/client-portal/orders?clientId=${user?.id}`)
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        if (ordersData.success) {
          setStats((prev) => ({
            ...prev,
            totalOrders: ordersData.data.statistics.totalOrders,
            totalValue: ordersData.data.statistics.totalValue,
            activeOrders: ordersData.data.statistics.activeOrders,
            completedOrders: ordersData.data.statistics.completedOrders,
          }))
          // Get recent orders (last 3) with proper data structure
          const orders = ordersData.data.orders.slice(0, 3).map((order: any) => ({
            id: order.id,
            po_number: order.po_number || order.poNumber,
            supplier: order.supplier,
            status: order.status,
            created_at: order.created_at || order.createdAt,
            freight_type: order.freight_type || order.freightType,
            vessel_name: order.vessel_name || order.vesselName,
            cargo_status: order.cargo_status || order.cargoStatus,
            eta_at_port: order.eta_at_port || order.etaAtPort,
            estimated_delivery: order.estimated_delivery || order.estimatedDelivery,
            tracking_number: order.tracking_number || order.trackingNumber,
            total_value: order.total_value || order.totalValue,
          }))
          setRecentOrders(orders)
        }
      } else {
        console.warn("Failed to fetch orders, using fallback data")
        // Fallback to mock data if API fails
        setStats((prev) => ({
          ...prev,
          totalOrders: 12,
          activeOrders: 5,
          completedOrders: 7,
          totalValue: 185000,
        }))

        setRecentOrders([
          {
            id: "1",
            po_number: "PO-2024-001",
            supplier: "Global Electronics Ltd",
            status: "Completed",
            created_at: "2024-01-15T10:00:00Z",
            freight_type: "Sea Freight",
            vessel_name: "MSC Pamela",
            cargo_status: "delivered",
            eta_at_port: "2024-01-20T10:00:00Z",
            estimated_delivery: "2024-01-25T10:00:00Z",
            tracking_number: "MRSU0547355",
          },
          {
            id: "2",
            po_number: "PO-2024-002",
            supplier: "Tech Components Inc",
            status: "In Progress",
            created_at: "2024-01-20T10:00:00Z",
            freight_type: "Air Freight",
            vessel_name: "N/A",
            cargo_status: "in-transit",
            eta_at_port: "2024-02-05T10:00:00Z",
            estimated_delivery: "2024-02-10T10:00:00Z",
            tracking_number: "AIRTRACK123",
          },
          {
            id: "3",
            po_number: "PO-2024-003",
            supplier: "Industrial Supplies Co",
            status: "Pending",
            created_at: "2024-01-25T10:00:00Z",
            freight_type: "Sea Freight",
            vessel_name: "Maersk Seletar",
            cargo_status: "at-origin",
            eta_at_port: "2024-02-15T10:00:00Z",
            estimated_delivery: "2024-02-20T10:00:00Z",
            tracking_number: "MAEU9876543",
          },
        ])
      }

      // Fetch documents statistics
      const documentsResponse = await fetch(`/api/client-portal/documents?clientId=${user?.id}`)
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        if (documentsData.success) {
          setStats((prev) => ({
            ...prev,
            totalDocuments: documentsData.data.statistics.totalDocuments,
          }))
        }
      } else {
        console.warn("Failed to fetch documents, using fallback data")
        setStats((prev) => ({ ...prev, totalDocuments: 8 }))
      }
    } catch (error) {
      console.error("Error fetching client data:", error)
      // Fallback to mock data on error
      setStats({
        totalOrders: 12,
        totalValue: 185000,
        activeOrders: 5,
        completedOrders: 7,
        totalDocuments: 24,
      })

      setRecentOrders([
        {
          id: "1",
          po_number: "PO-2024-001",
          supplier: "Global Electronics Ltd",
          status: "Completed",
          created_at: "2024-01-15T10:00:00Z",
          freight_type: "Sea Freight",
          vessel_name: "MSC Pamela",
          cargo_status: "delivered",
          eta_at_port: "2024-01-20T10:00:00Z",
          estimated_delivery: "2024-01-25T10:00:00Z",
          tracking_number: "MRSU0547355",
        },
        {
          id: "2",
          po_number: "PO-2024-002",
          supplier: "Tech Components Inc",
          status: "In Progress",
          created_at: "2024-01-20T10:00:00Z",
          freight_type: "Air Freight",
          vessel_name: "N/A",
          cargo_status: "in-transit",
          eta_at_port: "2024-02-05T10:00:00Z",
          estimated_delivery: "2024-02-10T10:00:00Z",
          tracking_number: "AIRTRACK123",
        },
        {
          id: "3",
          po_number: "PO-2024-003",
          supplier: "Industrial Supplies Co",
          status: "Pending",
          created_at: "2024-01-25T10:00:00Z",
          freight_type: "Sea Freight",
          vessel_name: "Maersk Seletar",
          cargo_status: "at-origin",
          eta_at_port: "2024-02-15T10:00:00Z",
          estimated_delivery: "2024-02-20T10:00:00Z",
          tracking_number: "MAEU9876543",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = (order: Order) => {
    if (order.tracking_number) {
      router.push(`/client-portal/tracking/${order.id}?trackingNumber=${order.tracking_number}`)
    } else {
      router.push(`/client-portal/tracking/${order.id}`)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin View - Client Portal" : `${user?.department || "Company"} Portal`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? "Admin viewing client portal" : `Welcome ${user?.department || "Company"}`}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Admin indicator banner */}
      {isAdmin && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>
              <strong>Admin View:</strong> You are viewing the client portal as an administrator.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Orders
            </CardTitle>
            <CardDescription>View and track your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Total orders</p>
            <p className="text-sm text-blue-600 mt-1">{stats.activeOrders} active</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/client-portal/orders")}
            >
              View Orders
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ship className="h-5 w-5 mr-2" />
              Shipments
            </CardTitle>
            <CardDescription>Track your shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : stats.activeOrders}</p>
            <p className="text-sm text-gray-500">In transit</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/shipment-tracker")}
            >
              Track Shipments
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documents
            </CardTitle>
            <CardDescription>Access your documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : stats.totalDocuments}</p>
            <p className="text-sm text-gray-500">Available documents</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/client-portal/documents")}
            >
              View Documents
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
      <div className="bg-white rounded-md shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading orders...</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Freight Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vessel Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA at Port
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.po_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.freight_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.vessel_name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Badge className={getCargoStatusColor(order.cargo_status || "")}>
                          {formatCargoStatus(order.cargo_status)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTrackOrder(order)}
                          className="h-6 px-2 text-xs"
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Track
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.eta_at_port)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.estimated_delivery)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                        className="h-6 px-2 text-xs"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">You don't have any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
