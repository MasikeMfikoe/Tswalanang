"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { customers } from "@/lib/sample-data"

export default function Customers() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateNewCustomer = () => {
    // Use direct navigation with full URL path to ensure correct routing
    window.location.href = "/customers/new"
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button onClick={handleCreateNewCustomer}>Create New Customer</Button>
        </div>
      </div>

      {/* Search field */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Customer list */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-sm text-gray-500">Total Orders: {customer.totalOrders}</p>
              </div>
              <Button asChild>
                <Link href={`/customers/${customer.id}`}>View</Link>
              </Button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No customers found.</p>
        )}
      </div>
    </div>
  )
}
