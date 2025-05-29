"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "@/lib/toast"

export default function CourierOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourierOrders()
  }, [])

  const fetchCourierOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("courier_orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching courier orders:", error)
      toast.error("Failed to load courier orders")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id) => {
    router.push(`/courier-orders/details/${id}`)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courier Orders</h1>
        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => router.push("/courier-orders/new")}>
          New Courier Order
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading courier orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No courier orders found</p>
          <Button onClick={() => router.push("/courier-orders/new")}>Create your first courier order</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Waybill No</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Sender</th>
                <th className="border p-2 text-left">Receiver</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Service Type</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border p-2">{order.waybill_no}</td>
                  <td className="border p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">{order.sender}</td>
                  <td className="border p-2">{order.receiver}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "in-transit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="border p-2">{order.service_type}</td>
                  <td className="border p-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(order.id)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
