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

interface Customer {
  id: string
  name: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  primaryContact: {
    name: string
    landline: string
    cellphone: string
    email: string
  }
  secondaryContact: {
    name: string
    landline: string
    cellphone: string
    email: string
  }
  totalOrders: number
  vatNumber?: string
  importersCode?: string
}

interface Order {
  id: string
  poNumber: string
}

export default function CustomerDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // In a real application, fetch customer data from API
    const fetchedCustomer: Customer = {
      id: params.id,
      name: "Acme Corp",
      address: {
        street: "123 Business Road",
        city: "Johannesburg",
        postalCode: "2000",
        country: "South Africa",
      },
      primaryContact: {
        name: "John Doe",
        landline: "011-123-4567",
        cellphone: "+27 82 123 4567",
        email: "john.doe@acmecorp.com",
      },
      secondaryContact: {
        name: "Jane Smith",
        landline: "011-987-6543",
        cellphone: "+27 72 987 6543",
        email: "jane.smith@acmecorp.com",
      },
      totalOrders: 15,
      vatNumber: "4220195124",
      importersCode: "IC78901234",
    }

    setCustomer(fetchedCustomer)
    setEditedCustomer(fetchedCustomer)

    setOrders([
      { id: "1", poNumber: "PO12345" },
      { id: "2", poNumber: "PO67890" },
      { id: "3", poNumber: "PO24680" },
    ])
  }, [params.id])

  const handleInputChange = (field: string, value: string) => {
    setEditedCustomer((prev) => {
      if (!prev) return null
      if (field === "primaryContact" || field === "secondaryContact") {
        const [name, email, cellphone, landline] = value.split(" | ")
        return {
          ...prev,
          [field]: { ...prev[field], name, email, cellphone, landline },
        }
      }
      if (field in prev) {
        return { ...prev, [field]: value }
      }
      if (field in prev.address) {
        return { ...prev, address: { ...prev.address, [field]: value } }
      }
      return prev
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Updating customer:", editedCustomer)
    setCustomer(editedCustomer)
    setIsEditing(false)
    toast({
      title: "Success",
      description: "Customer details updated successfully.",
    })
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  if (!customer) {
    return <div>Loading...</div>
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
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="rateCard">Rate Card</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Customer Information</CardTitle>
                {!isEditing && (
                  <div className="flex space-x-2">
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Details
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ul className="space-y-2">
                    {[
                      { label: "Customer Name", key: "name", value: customer.name },
                      { label: "VAT Number", key: "vatNumber", value: customer.vatNumber || "Not provided" },
                      {
                        label: "Importer's Code",
                        key: "importersCode",
                        value: customer.importersCode || "Not provided",
                      },
                      { label: "Address", key: "address", value: customer.address.street },
                      { label: "City", key: "city", value: customer.address.city },
                      { label: "Postal Code", key: "postalCode", value: customer.address.postalCode },
                      { label: "Country", key: "country", value: customer.address.country },
                      {
                        label: "Primary Contact",
                        key: "primaryContact",
                        value: `${customer.primaryContact.name} | ${customer.primaryContact.email} | ${customer.primaryContact.cellphone} | ${customer.primaryContact.landline}`,
                      },
                      {
                        label: "Secondary Contact",
                        key: "secondaryContact",
                        value: `${customer.secondaryContact.name} | ${customer.secondaryContact.email} | ${customer.secondaryContact.cellphone} | ${customer.secondaryContact.landline}`,
                      },
                    ].map(({ label, key, value }) => (
                      <li key={key} className="flex items-center space-x-3">
                        <Label className="font-semibold w-32">{label}:</Label>
                        {isEditing ? (
                          <Input
                            className="w-48"
                            value={editedCustomer?.[key as keyof typeof editedCustomer] || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-700">{value}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{order.poNumber}</p>
                      </div>
                      <Button onClick={() => router.push(`/orders/${order.id}`)}>View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rateCard" className="mt-4">
            <RateCard customerId={params.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
