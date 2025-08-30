"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RateCard } from "@/components/RateCard"
import { Spinner } from "@/components/ui/spinner"

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

export default function CustomerDetailsClient({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/customers/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customer details")
      }

      const customerData: Customer = data.customer ?? data.data ?? data
      setCustomer(customerData)
      setEditedCustomer(customerData)
      setOrders(data.orders || [])
    } catch (err: any) {
      setError(err?.message || "Failed to fetch customer details")
      toast({
        title: "Error",
        description: "Failed to fetch customer details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Customer, value: string) => {
    setEditedCustomer((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedCustomer) return

    try {
      setSaving(true)
      // Prefer going through your API route that uses the server Supabase client
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to update customer")

      const updated: Customer = json.data ?? json.customer ?? editedCustomer
      setCustomer(updated)
      setEditedCustomer(updated)
      setIsEditing(false)
      toast({ title: "Success", description: "Customer details updated successfully" })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update customer details",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner />
          <p>Loading customer details...</p>
        </div>
      </div>
    )
  }

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
            <p>Current URL: /customers/details/{id}</p>
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
                            value={(editedCustomer?.[key as keyof Customer] as string) ?? ""}
                            onChange={(e) => handleInputChange(key as keyof Customer, e.target.value)}
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
                {orders.length === 0 ? (
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
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
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
            <RateCard customerId={id} isEditable={isEditing} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
