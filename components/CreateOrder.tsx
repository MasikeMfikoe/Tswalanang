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
import { ordersApi } from "@/lib/api/ordersApi"
import { customersApi } from "@/lib/api/customersApi"
import { useErrorHandler } from "@/lib/errorHandling"
import type { Order, Customer, Status, CargoStatus, FreightType } from "@/types/models"

export default function CreateOrder() {
  const router = useRouter()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()

  // State for order form
  const [order, setOrder] = useState<Partial<Order>>({
    poNumber: "",
    supplier: "",
    importer: "",
    status: "Pending",
    cargoStatus: "instruction-sent",
    freightType: "Sea Freight",
  })

  // State for UI
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)

  // Fetch customers on component mount
  React.useEffect(() => {
    fetchCustomers()
  }, [])

  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true)
    try {
      const response = await customersApi.getCustomers()
      setCustomers(response.data)
    } catch (error) {
      handleError(error, {
        component: "CreateOrder",
        action: "fetchCustomers",
      })
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
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await ordersApi.createOrder(order)

      toast({
        title: "Success",
        description: `Order ${response.data.poNumber} created successfully.`,
      })

      router.push("/orders")
    } catch (error) {
      handleError(error, {
        component: "CreateOrder",
        action: "createOrder",
        data: { order },
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
                        value={order.poNumber}
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
                      value={order.supplier}
                      onChange={(e) => handleChange("supplier", e.target.value)}
                      required
                      className={errors.supplier ? "border-red-500" : ""}
                    />
                    {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importer">Importer</Label>
                    <Select
                      value={order.importer}
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
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.name}>
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.importer && <p className="text-red-500 text-xs mt-1">{errors.importer}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freightType">Freight Type</Label>
                    <Select
                      value={order.freightType}
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
                    <Select value={order.status} onValueChange={(value) => handleChange("status", value as Status)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="cargoStatus">Cargo Status</Label>
                    <Select
                      value={order.cargoStatus}
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
