"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { deliveries } from "@/lib/sample-data"

export default function DeliveriesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filteredDeliveries = deliveries.filter((delivery) => {
    return (
      (statusFilter === "All" || delivery.status === statusFilter) &&
      delivery.orderNumber.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Deliveries</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
            <Button onClick={() => router.push("/deliveries/new")}>Create New Delivery</Button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <Input
            placeholder="Search by Order Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2"
          />
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{delivery.orderNumber}</p>
                <p className="text-sm text-gray-600">Status: {delivery.status}</p>
                <p className="text-sm text-gray-500">Estimated Delivery: {delivery.estimatedDelivery}</p>
                <p className="text-sm text-gray-500">Driver: {delivery.driverName}</p>
                <p className="text-sm text-gray-500">Company: {delivery.deliveryCompany}</p>
                <Link href={`/orders/${delivery.poNumber}`} className="text-sm text-blue-600 hover:underline">
                  PO Number: {delivery.poNumber}
                </Link>
              </div>
              <Button onClick={() => router.push(`/deliveries/${delivery.id}`)}>View Details</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
