"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewOrderDocumentUpload } from "@/components/NewOrderDocumentUpload"
import { supabase } from "@/lib/supabase"
import type { Order, Customer, Status, CargoStatus, FreightType } from "@/types/models"
import { Textarea } from "@/components/ui/textarea"

export default function CreateOrder() {
  const router = useRouter()
  const { toast } = useToast()

  // State for order form
  const [order, setOrder] = useState<Partial<Order>>({
    poNumber: "",
    supplier: "",
    importer: "",
    status: "Pending",
    cargoStatus: "instruction-sent",
    freightType: "Sea Freight",
    cargoStatusComment: "",
    origin: "", // Add origin field
    destination: "", // Add destination field
  })

  // State for UI
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [customersFetchError, setCustomersFetchError] = useState<string | null>(null)

  // Fetch customers on component mount
  React.useEffect(() => {
    fetchCustomers()
  }, [])

  // Fetch customers directly from Supabase
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true)
    setCustomersFetchError(null)

    try {
      const { data, error } = await supabase.from("customers").select("*").order("name")

      if (error) {
        console.error("Error fetching customers:", error)
        setCustomersFetchError("Failed to load customers")
        // Use fallback customers
        setCustomers([
          {
            id: "demo-1",
            name: "ABC Trading Company",
            contactPerson: "John Smith",
            email: "john@abctrading.com",
            phone: "+1-555-0123",
            address: {
              street: "123 Business Ave",
              city: "New York",
              postalCode: "10001",
              country: "USA",
            },
            totalOrders: 15,
            totalSpent: 125000,
            vatNumber: "US123456789",
            importersCode: "IMP001",
            createdAt: new Date().toISOString(),
          },
          {
            id: "demo-2",
            name: "Global Imports Ltd",
            contactPerson: "Sarah Johnson",
            email: "sarah@globalimports.com",
            phone: "+1-555-0456",
            address: {
              street: "456 Commerce St",
              city: "Los Angeles",
              postalCode: "90210",
              country: "USA",
            },
            totalOrders: 8,
            totalSpent: 75000,
            vatNumber: "US987654321",
            importersCode: "IMP002",
            createdAt: new Date().toISOString(),
          },
        ])
      } else {
        setCustomers(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      setCustomersFetchError("Failed to load customers")
      // Use fallback customers on error
      setCustomers([
        {
          id: "fallback-1",
          name: "Demo Customer 1",
          contactPerson: "Demo Contact",
          email: "demo1@example.com",
          phone: "+1-555-0001",
          address: {
            street: "123 Demo St",
            city: "Demo City",
            postalCode: "12345",
            country: "USA",
          },
          totalOrders: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  // Generate a unique PO number
  function generatePONumber() {
    const prefix = "PO"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setOrder((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!order.poNumber) newErrors.poNumber = "PO Number is required"
    if (!order.supplier) newErrors.supplier = "Supplier is required"
    if (!order.importer) newErrors.importer = "Importer is required"
    if (!order.origin) newErrors.origin = "Origin is required"
    if (!order.destination) newErrors.destination = "Destination is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission - Save directly to Supabase
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Prepare order data for Supabase - include all required fields
      const orderData = {
        order_number: order.poNumber,
        po_number: order.poNumber,
        supplier: order.supplier,
        importer: order.importer,
        origin: order.origin || "Unknown", // Provide default value
        destination: order.destination || "Unknown", // Provide default value
        status: order.status || "Pending",
        cargo_status: order.cargoStatus || "instruction-sent",
        freight_type: order.freightType || "Sea Freight",
        cargo_status_comment: order.cargoStatusComment || "",
        total_value: 0,
        customer_name: order.importer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("orders").insert([orderData]).select().single()

      if (error) {
        console.error("Supabase error:", error)
        toast({
          title: "Error",
          description: `Failed to create order: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Order ${orderData.order_number} created successfully!`,
      })

      router.push("/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Order</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Order"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poNumber">PO Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="poNumber"
                        value={order.poNumber || ""}
                        onChange={(e) => handleChange("poNumber", e.target.value)}
                        aria-label="PO Number"
                        required
                        placeholder="Enter PO number or generate one"
                        className={errors.poNumber ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleChange("poNumber", generatePONumber())}
                      >
                        Generate
                      </Button>
                    </div>
                    {errors.poNumber && <p className="text-red-500 text-xs mt-1">{errors.poNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={order.supplier || ""}
                      onChange={(e) => handleChange("supplier", e.target.value)}
                      required
                      className={errors.supplier ? "border-red-500" : ""}
                    />
                    {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importer">Importer</Label>
                    <Select
                      value={order.importer || ""}
                      onValueChange={(value) => handleChange("importer", value)}
                      disabled={isLoadingCustomers}
                    >
                      <SelectTrigger className={errors.importer ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select importer" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCustomers ? (
                          <SelectItem value="loading" disabled>
                            Loading customers...
                          </SelectItem>
                        ) : customersFetchError ? (
                          <SelectItem value="error" disabled>
                            Error loading customers - using fallback data
                          </SelectItem>
                        ) : customers && customers.length > 0 ? (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.name}>
                              {customer.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-customers" disabled>
                            No customers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.importer && <p className="text-red-500 text-xs mt-1">{errors.importer}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={order.origin || ""}
                      onChange={(e) => handleChange("origin", e.target.value)}
                      required
                      placeholder="Enter origin location"
                      className={errors.origin ? "border-red-500" : ""}
                    />
                    {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={order.destination || ""}
                      onChange={(e) => handleChange("destination", e.target.value)}
                      required
                      placeholder="Enter destination location"
                      className={errors.destination ? "border-red-500" : ""}
                    />
                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freightType">Freight Type</Label>
                    <Select
                      value={order.freightType || "Sea Freight"}
                      onValueChange={(value) => handleChange("freightType", value as FreightType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select freight type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                        <SelectItem value="Air Freight">Air Freight</SelectItem>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="FOB">FOB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Order Status</Label>
                    <Select
                      value={order.status || "Pending"}
                      onValueChange={(value) => handleChange("status", value as Status)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="cargoStatus">Cargo Status</Label>
                    <Select
                      value={order.cargoStatus || "instruction-sent"}
                      onValueChange={(value) => handleChange("cargoStatus", value as CargoStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cargo status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instruction-sent">Instruction Sent to Agent</SelectItem>
                        <SelectItem value="agent-response">Agent Response</SelectItem>
                        <SelectItem value="at-origin">At Origin</SelectItem>
                        <SelectItem value="cargo-departed">Cargo Departed</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="at-destination">At Destination</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="cargoStatusNotes">Cargo Status Notes</Label>
                    <Textarea
                      id="cargoStatusNotes"
                      placeholder="Add notes about the cargo status"
                      value={order.cargoStatusComment || ""}
                      onChange={(e) => handleChange("cargoStatusComment", e.target.value)}
                      className="resize-y"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList>
                  <TabsTrigger value="upload">Upload Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <NewOrderDocumentUpload />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
