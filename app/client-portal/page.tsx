"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, FileText, DollarSign, Calendar, ArrowLeft } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient" // Import supabase

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockDashboardData = {
  totalOrders: 120,
  activeOrders: 45,
  completedOrders: 75,
  totalDocuments: 300,
  recentOrders: [
    {
      id: "ORD-2024-001",
      po_number: "PO-ABC-001",
      status: "In Progress",
      created_at: "2024-01-15T10:00:00Z",
      total_value: 25000,
    },
    {
      id: "ORD-2024-002",
      po_number: "PO-ABC-002",
      status: "Completed",
      created_at: "2024-01-10T14:30:00Z",
      total_value: 15000,
    },
    {
      id: "ORD-2024-003",
      po_number: "PO-ABC-003",
      status: "Pending",
      created_at: "2024-01-20T09:00:00Z",
      total_value: 35000,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-600"
    case "in progress":
      return "text-blue-600"
    case "pending":
      return "text-yellow-600"
    case "cancelled":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(mockDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientData = async () => {
    if (!user?.id) {
      setDashboardData(mockDashboardData)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
      const documentsResponse = await fetch(`/api/client-portal/documents?clientId=${user.id}`)

      if (!response.ok || !documentsResponse.ok) {
        throw new Error("Failed to fetch client portal data")
      }

      const ordersData = await response.json()
      const docsData = await documentsResponse.json()

      if (ordersData.success && docsData.success) {
        const orders = ordersData.data.orders || []
        const documents = docsData.data.documents || []

        const totalOrders = orders.length
        const activeOrders = orders.filter(
          (order: any) => order.status?.toLowerCase() === "in progress" || order.status?.toLowerCase() === "pending",
        ).length
        const completedOrders = orders.filter((order: any) => order.status?.toLowerCase() === "completed").length
        const totalDocuments = documents.length

        // Sort recent orders by created_at descending
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3) // Get top 3 recent orders

        setDashboardData({
          totalOrders,
          activeOrders,
          completedOrders,
          totalDocuments,
          recentOrders,
        })
      } else {
        console.warn("API returned success: false, using mock data.", ordersData.error, docsData.error)
        setDashboardData(mockDashboardData)
      }
    } catch (err: any) {
      console.error("Error fetching client portal data:", err)
      setError(err.message || "Failed to load dashboard data.")
      setDashboardData(mockDashboardData) // Fallback to mock data on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()

    // Set up Realtime subscriptions
    const ordersChannel = supabase
      .channel("client_portal_orders_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        console.log("Realtime order change:", payload)
        fetchClientData() // Re-fetch data on any order change
      })
      .subscribe()

    const documentsChannel = supabase
      .channel("client_portal_documents_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (payload) => {
        console.log("Realtime document change:", payload)
        fetchClientData() // Re-fetch data on any document change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(documentsChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  const isAdmin = user?.role === "admin"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading client portal...</p>
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
        <Button onClick={fetchClientData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Admin View – Client Portal Dashboard</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin View – Client Portal" : `Welcome, ${user?.department || "Client"}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? "Admin viewing client dashboard" : "Your personalized logistics overview"}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.activeOrders}</div>
              <p className="text-xs text-gray-500">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.completedOrders}</div>
              <p className="text-xs text-gray-500">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalDocuments}</div>
              <p className="text-xs text-gray-500">Available for download</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-6 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest shipment activities</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No recent orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PO Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.po_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          R {order.total_value?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push("/client-portal/orders")}>
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to key sections</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/client-portal/orders")}
            >
              <Package className="mr-2 h-4 w-4" /> View All Orders
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/client-portal/documents")}
            >
              <FileText className="mr-2 h-4 w-4" /> View All Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
