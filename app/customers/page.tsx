"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  const [error, setError] = useState<string | null>(null)

  // Fetch customers from API instead of direct Supabase
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the API endpoint instead of direct Supabase
      const response = await fetch("/api/customers")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch customers")
      }

      const result = await response.json()

      if (!result.data) {
        throw new Error("Invalid response format")
      }

      setCustomers(result.data || [])

      // Log success for debugging
      console.log(`Successfully loaded ${result.data.length} customers`)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError((error as Error).message)
      toast({
        variant: "destructive",
        title: "Error loading customers",
        description: (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateNewCustomer = () => {
    console.log("Navigating to new customer page...")
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h2 className="text-red-800 font-medium">Error loading customers</h2>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchCustomers} className="mt-2">
            Try Again
          </Button>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
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

      <Card>
        <CardContent className="pt-6">
          {/* Search and controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchCustomers} className="whitespace-nowrap">
              Refresh List
            </Button>
          </div>

          {/* Customer list */}
          <div className="space-y-4">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email || "No email"}</p>
                    <p className="text-sm text-gray-500">Contact: {customer.contact_person || "No contact person"}</p>
                    <p className="text-sm text-gray-500">Total Orders: {customer.total_orders}</p>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild variant="ghost">
                    <Link href={`/customers/details/${customer.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {customers.length === 0 ? "No customers found." : "No customers match your search."}
                </p>
                {customers.length === 0 && (
                  <Button onClick={handleCreateNewCustomer}>Create Your First Customer</Button>
                )}
              </div>
            )}
          </div>

          {/* Results summary */}
          {customers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
