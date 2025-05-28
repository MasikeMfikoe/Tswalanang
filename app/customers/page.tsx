"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Customer {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  total_orders: number
  total_spent: number
  created_at: string
}

export default function Customers() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch customers from Supabase
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching customers:", error)
        toast({
          variant: "destructive",
          title: "Error loading customers",
          description: error.message,
        })
        return
      }

      setCustomers(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Error loading customers",
        description: "Failed to load customers from database",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateNewCustomer = () => {
    router.push("/customers/new")
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading customers...</span>
        </div>
      </div>
    )
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

      {/* Refresh button */}
      <div className="mb-4">
        <Button variant="outline" onClick={fetchCustomers}>
          Refresh List
        </Button>
      </div>

      {/* Customer list */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email || "No email"}</p>
                <p className="text-sm text-gray-500">Contact: {customer.contact_person || "No contact person"}</p>
                <p className="text-sm text-gray-500">Total Orders: {customer.total_orders}</p>
                <p className="text-sm text-gray-400">Created: {new Date(customer.created_at).toLocaleDateString()}</p>
              </div>
              <Button asChild>
                <Link href={`/customers/${customer.id}`}>View</Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {customers.length === 0 ? "No customers found." : "No customers match your search."}
            </p>
            {customers.length === 0 && <Button onClick={handleCreateNewCustomer}>Create Your First Customer</Button>}
          </div>
        )}
      </div>
    </div>
  )
}
