"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, FileText, Ship, AlertCircle } from "lucide-react"

export default function ClientPortalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === "admin"

  return (
    <div className="container mx-auto py-6 px-4">
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

      <h1 className="text-3xl font-bold mb-2">
        Client Portal {isAdmin && <span className="text-blue-600">(Admin View)</span>}
      </h1>
      <p className="text-gray-500 mb-6">
        Welcome back, {user?.name} {user?.surname}
      </p>

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
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-gray-500">Active orders</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/client-portal/orders")}>
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
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-gray-500">In transit</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/shipment-tracker")}>
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
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-gray-500">Available documents</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/client-portal/documents")}>
              View Documents
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              {
                id: "ORD-2023-001",
                date: "2023-06-15",
                status: "Delivered",
                amount: "$1,250.00",
              },
              {
                id: "ORD-2023-002",
                date: "2023-06-20",
                status: "In Transit",
                amount: "$850.00",
              },
              {
                id: "ORD-2023-003",
                date: "2023-06-25",
                status: "Processing",
                amount: "$2,100.00",
              },
            ].map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id} {isAdmin && <span className="text-xs text-blue-600 ml-2">(Admin View)</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "In Transit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
