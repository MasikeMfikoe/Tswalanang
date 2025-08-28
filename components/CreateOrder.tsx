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
import EDISubmissionStatus from "@/components/EDISubmissionStatus"
import { supabase } from "@/lib/supabase"
import type { Order, Customer, Status, CargoStatus, FreightType } from "@/types/models"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid" // Import uuidv4

export default function CreateOrder() {
  const router = useRouter()
  const { toast } = useToast()

  // State for freight types
  const [freightTypes, setFreightTypes] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [isLoadingFreightTypes, setIsLoadingFreightTypes] = useState(true)

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
    tracking_number: "", // Add tracking_number field
  })

  // State for order financials
  const [financials, setFinancials] = useState({
    commercialValue: 0,
    customsDuties: 0,
    customsVAT: 0, // Auto-calculated (15% of commercial value)
    handlingFees: 0,
    shippingCost: 0,
    documentationFee: 0, // From rate card
    communicationFee: 0, // From rate card
    facilityFee: 0, // From rate card (percentage)
    agencyFee: 0, // From rate card (percentage)
    notes: "",
  })

  const [customerRateCard, setCustomerRateCard] = useState<any>(null)

  // State for UI
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [customersFetchError, setCustomersFetchError] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  // Fetch customers on component mount
  React.useEffect(() => {
    fetchCustomers()
    fetchFreightTypes()
  }, [])

  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoadingCustomers(true)
    setCustomersFetchError(null)

    try {
      console.log("[v0] 🔄 Fetching customers from API")
      const response = await fetch("/api/customers")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] ✅ Customers API response:", result)

      if (result.success && result.data) {
        setCustomers(result.data)
        console.log(`[v0] ✅ Successfully loaded ${result.data.length} customers`)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (error) {
      console.error("[v0] ❌ Error fetching customers:", error)
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

  // Fetch freight types from API
  const fetchFreightTypes = async () => {
    setIsLoadingFreightTypes(true)
    try {
      console.log("[v0] 🔄 Fetching freight types from API")
      const response = await fetch("/api/freight-types")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] ✅ Freight types API response:", result)

      if (result.success && result.data) {
        setFreightTypes(result.data)
        console.log(`[v0] ✅ Successfully loaded ${result.data.length} freight types`)
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (error) {
      console.error("[v0] ❌ Error fetching freight types:", error)
      // Use fallback data
      setFreightTypes([
        { id: "1", name: "Sea Freight", code: "SEA" },
        { id: "2", name: "Air Freight", code: "AIR" },
        { id: "3", name: "EXW", code: "EXW" },
        { id: "4", name: "FOB", code: "FOB" },
      ])
    } finally {
      setIsLoadingFreightTypes(false)
    }
  }

  // Generate a unique PO number using UUID
  function generatePONumber() {
    return uuidv4()
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

  // Calculate financial totals
  const calculateFinancials = () => {
    const customsVAT = financials.commercialValue * 0.15
    const totalDisbursements =
      financials.customsDuties +
      customsVAT +
      financials.handlingFees +
      financials.shippingCost +
      financials.documentationFee +
      financials.communicationFee
    const facilityFeeAmount = (totalDisbursements * financials.facilityFee) / 100
    const agencyFeeAmount = (totalDisbursements * financials.agencyFee) / 100
    const subtotal = totalDisbursements + facilityFeeAmount + agencyFeeAmount
    const vat = subtotal * 0.15
    const total = subtotal + vat

    return {
      customsVAT,
      totalDisbursements,
      facilityFeeAmount,
      agencyFeeAmount,
      subtotal,
      vat,
      total,
    }
  }

  // Handle financial field changes
  const handleFinancialChange = (field: string, value: string) => {
    const numericValue = Number.parseFloat(value) || 0
    setFinancials((prev) => {
      const updated = { ...prev, [field]: numericValue }
      // Auto-calculate customs VAT when commercial value changes
      if (field === "commercialValue") {
        updated.customsVAT = numericValue * 0.15
      }
      return updated
    })
  }

  // Fetch customer rate card when customer changes
  const fetchCustomerRateCard = async (customerName: string) => {
    try {
      const customer = customers.find((c) => c.name === customerName)
      if (customer?.rateCard) {
        const rateCard = customer.rateCard
        const freightType = order.freightType || "Air Freight"
        const rates = freightType === "Air Freight" ? rateCard.airFreight : rateCard.seaFreight

        setCustomerRateCard(rateCard)
        setFinancials((prev) => ({
          ...prev,
          documentationFee: rates.documentationFee,
          communicationFee: rates.communicationFee,
          facilityFee: rates.facilityFee,
          agencyFee: rates.agencyFee,
        }))
      }
    } catch (error) {
      console.error("Error fetching customer rate card:", error)
    }
  }

  // Watch for customer and freight type changes to update rate card
  React.useEffect(() => {
    if (order.importer) {
      fetchCustomerRateCard(order.importer)
    }
  }, [order.importer, order.freightType, customers])

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
        tracking_number: order.tracking_number || null, // Include tracking number
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

      setCreatedOrderId(data.id)

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
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="information" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="information">Order Information</TabsTrigger>
                  <TabsTrigger value="financials">Order Financials</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="edi-submission" disabled={!createdOrderId}>
                    EDI Submission Status
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="information" className="mt-6">
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
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                          id="trackingNumber"
                          value={order.tracking_number || ""}
                          onChange={(e) => handleChange("tracking_number", e.target.value)}
                          placeholder="Enter tracking number (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freightType">Freight Type</Label>
                        <Select
                          value={order.freightType || "Sea Freight"}
                          onValueChange={(value) => handleChange("freightType", value as FreightType)}
                          disabled={isLoadingFreightTypes}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select freight type" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingFreightTypes ? (
                              <SelectItem value="loading" disabled>
                                Loading freight types...
                              </SelectItem>
                            ) : freightTypes.length > 0 ? (
                              freightTypes.map((freightType) => (
                                <SelectItem key={freightType.id} value={freightType.name}>
                                  {freightType.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-types" disabled>
                                No freight types available
                              </SelectItem>
                            )}
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
                </TabsContent>

                <TabsContent value="financials" className="mt-6">
                  <div className="space-y-6">
                    {/* Financial Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commercialValue">Commercial Value (R)</Label>
                        <Input
                          id="commercialValue"
                          type="number"
                          step="0.01"
                          value={financials.commercialValue}
                          onChange={(e) => handleFinancialChange("commercialValue", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customsDuties">Customs Duties (R)</Label>
                        <Input
                          id="customsDuties"
                          type="number"
                          step="0.01"
                          value={financials.customsDuties}
                          onChange={(e) => handleFinancialChange("customsDuties", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customsVAT">Customs VAT (15% of commercial value)</Label>
                        <Input
                          id="customsVAT"
                          type="number"
                          step="0.01"
                          value={calculateFinancials().customsVAT.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="handlingFees">Handling Fees (R)</Label>
                        <Input
                          id="handlingFees"
                          type="number"
                          step="0.01"
                          value={financials.handlingFees}
                          onChange={(e) => handleFinancialChange("handlingFees", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCost">Shipping Cost (R)</Label>
                        <Input
                          id="shippingCost"
                          type="number"
                          step="0.01"
                          value={financials.shippingCost}
                          onChange={(e) => handleFinancialChange("shippingCost", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentationFee">Documentation Fee ({order.freightType || "Air"}) (R)</Label>
                        <Input
                          id="documentationFee"
                          type="number"
                          step="0.01"
                          value={financials.documentationFee.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="communicationFee">Communication Fee ({order.freightType || "Air"}) (R)</Label>
                        <Input
                          id="communicationFee"
                          type="number"
                          step="0.01"
                          value={financials.communicationFee.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Notes - Full Width */}
                    <div className="space-y-2">
                      <Label htmlFor="financialNotes">Notes</Label>
                      <Textarea
                        id="financialNotes"
                        placeholder="Add any financial notes or comments..."
                        value={financials.notes}
                        onChange={(e) => handleFinancialChange("notes", e.target.value)}
                        className="resize-y min-h-[100px]"
                      />
                    </div>

                    {/* Summary Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span>Total Disbursements:</span>
                          <span>R {calculateFinancials().totalDisbursements.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Facility Fee ({financials.facilityFee}%):</span>
                          <span>R {calculateFinancials().facilityFeeAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Agency Fee ({financials.agencyFee}%):</span>
                          <span>R {calculateFinancials().agencyFeeAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Subtotal:</span>
                          <span>R {calculateFinancials().subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (15%):</span>
                          <span>R {calculateFinancials().vat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-green-600">R {calculateFinancials().total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                  <NewOrderDocumentUpload />
                </TabsContent>

                {/* EDI Submission Status tab */}
                <TabsContent value="edi-submission" className="mt-6">
                  {createdOrderId ? (
                    <EDISubmissionStatus
                      orderId={createdOrderId}
                      isEditing={true}
                      currentUser="Current User" // Replace with actual user context
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Please save the order first to access EDI submission status.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
