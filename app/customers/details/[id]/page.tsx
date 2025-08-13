"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RateCard } from "@/components/RateCard"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabaseClient"

interface Customer {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  vat_number?: string
  importers_code?: string
  total_orders?: number
  total_spent?: number
  created_at?: string
  updated_at?: string
}

interface Order {
  id: string
  po_number: string
  supplier: string
  status: string
  freight_type: string
  total_value: number
  created_at: string
  customer_name?: string
  importer?: string
}

// <CHANGE> Updated component props to use Promise for Next.js 15 compatibility
export default function CustomerDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()

  // <CHANGE> Added state to store resolved params
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  // State management
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // <CHANGE> Added useEffect to resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params
        setResolvedParams(resolved)
      } catch (error) {
        console.error('Error resolving params:', error)
        setError('Failed to load page parameters')
        setLoading(false)
      }
    }
    resolveParams()
  }, [params])

  // Add this function before the fetchCustomer function
  const isValidUUID = (str: string) => {
    if (!str) return false
    // More lenient UUID validation - just check basic format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Update the fetchCustomer function to include validation
  const fetchCustomer = async () => {
    // <CHANGE> Updated to use resolvedParams instead of params
    if (!resolvedParams) return

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching customer with ID:", resolvedParams.id)

      // Validate UUID format
      if (!isValidUUID(resolvedParams.id)) {
        console.log("Invalid UUID format:", resolvedParams.id)
        throw new Error(`Invalid customer ID format: ${resolvedParams.id}`)
      }

      const { data, error } = await supabase.from("customers").select("*").eq("id", resolvedParams.id).single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      if (!data) {
        throw new Error("Customer not found")
      }

      console.log("Customer loaded successfully:", data.name)
      setCustomer(data)
      setEditedCustomer(data)
    } catch (error: any) {
      console.error("Error fetching customer:", error)
      setError(error.message || "Failed to fetch customer details")
      toast({
        title: "Error",
        description: "Failed to fetch customer details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch customer orders with fallback logic
  const fetchCustomerOrders = async () => {
    // <CHANGE> Updated to use resolvedParams instead of params
    if (!customer || !resolvedParams) return

    try {
      setOrdersLoading(true)

      // First, check if customer_id column exists by trying to query it
      const ordersQuery = supabase
        .from("orders")
        .select("id, po_number, supplier, status, freight_type, total_value, created_at, customer_name, importer")

      // Try to filter by customer_id first
      try {
        const { data: testData, error: testError } = await supabase.from("orders").select("customer_id").limit(1)

        if (!testError) {
          // customer_id column exists, use it
          const { data, error } = await ordersQuery
            .eq("customer_id", resolvedParams.id)
            .order("created_at", { ascending: false })

          if (error) throw error
          setOrders(data || [])
          return
        }
      } catch (columnError) {
        console.log("customer_id column doesn't exist, falling back to name matching")
      }

      // Fallback: match by customer name or importer name
      const { data, error } = await ordersQuery
        .or(`customer_name.eq.${customer.name},importer.eq.${customer.name}`)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setOrders(data || [])
    } catch (error: any) {
      console.error("Error fetching customer orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch customer orders",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  // <CHANGE> Updated useEffect to depend on resolvedParams instead of params
  // Load data on component mount - only for valid UUIDs
  useEffect(() => {
    if (resolvedParams && isValidUUID(resolvedParams.id)) {
      fetchCustomer()
    } else if (resolvedParams) {
      setLoading(false)
      setError(`Invalid customer ID format: ${resolvedParams.id}`)
    }
  }, [resolvedParams])

  // Fetch orders after customer is loaded
  useEffect(() => {
    if (customer) {
      fetchCustomerOrders()
    }
  }, [customer])

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setEditedCustomer((prev) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // <CHANGE> Updated to use resolvedParams instead of params
    if (!editedCustomer || !resolvedParams) return

    try {
      setSaving(true)

      const { data, error } = await supabase
        .from("customers")
        .update({
          name: editedCustomer.name,
          contact_person: editedCustomer.contact_person,
          email: editedCustomer.email,
          phone: editedCustomer.phone,
          address_street: editedCustomer.address_street,
          address_city: editedCustomer.address_city,
          address_postal_code: editedCustomer.address_postal_code,
          address_country: editedCustomer.address_country,
          vat_number: editedCustomer.vat_number,
          importers_code: editedCustomer.importers_code,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resolvedParams.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setCustomer(data)
      setEditedCustomer(data)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Customer details updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update customer details",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  // Loading state
  if (loading || !resolvedParams) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner />
          <p>Loading customer details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The requested customer could not be found."}</p>
          <div className="flex space-x-2 justify-center">
            <Button onClick={() => router.push("/customers/new")}>Create New Customer</Button>
            <Button variant="outline" onClick={() => router.push("/customers")}>
              Back to Customers
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Current URL: /customers/details/{resolvedParams.id}</p>
            <p>Expected: Valid UUID format</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Customer Details: {customer.name}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/customers")}>
              Back to Customers List
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="rateCard">Rate Card</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Customer Information</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Customer Name", key: "name", value: customer.name },
                      { label: "Contact Person", key: "contact_person", value: customer.contact_person },
                      { label: "Email", key: "email", value: customer.email, type: "email" },
                      { label: "Phone", key: "phone", value: customer.phone },
                      { label: "Street Address", key: "address_street", value: customer.address_street },
                      { label: "City", key: "address_city", value: customer.address_city },
                      { label: "Postal Code", key: "address_postal_code", value: customer.address_postal_code },
                      { label: "Country", key: "address_country", value: customer.address_country },
                      { label: "VAT Number", key: "vat_number", value: customer.vat_number || "" },
                      { label: "Importer's Code", key: "importers_code", value: customer.importers_code || "" },
                    ].map(({ label, key, value, type = "text" }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="font-semibold">
                          {label}
                        </Label>
                        {isEditing ? (
                          <Input
                            id={key}
                            type={type}
                            value={editedCustomer?.[key as keyof Customer] || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <p className="text-gray-700 p-2 bg-gray-50 rounded border min-h-[40px] flex items-center">
                            {value || "Not provided"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {customer.created_at && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        Created: {new Date(customer.created_at).toLocaleDateString()}
                        {customer.updated_at && (
                          <span className="ml-4">
                            Last updated: {new Date(customer.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <p className="text-sm text-gray-600">
                  {orders.length > 0
                    ? `Found ${orders.length} orders linked to this customer`
                    : "No orders found. Orders are matched by customer name or importer name."}
                </p>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                    <span className="ml-2">Loading orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No orders found for this customer.</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Orders are linked by matching customer name or importer name.
                    </p>
                    <Button className="mt-4" onClick={() => router.push("/orders/new")}>
                      Create First Order
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold">{order.po_number}</p>
                              <p className="text-sm text-gray-600">Supplier: {order.supplier}</p>
                            </div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{order.freight_type}</p>
                            </div>
                            <div>
                              <p className="font-medium">R {order.total_value?.toLocaleString() || "0"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => router.push(`/orders/${order.id}`)} size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rateCard" className="mt-4">
            {/* <CHANGE> Updated to use resolvedParams instead of params */}
            <RateCard customerId={resolvedParams.id} isEditable={isEditing} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
