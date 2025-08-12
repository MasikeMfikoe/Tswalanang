"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import DocumentManagement from "@/components/DocumentManagement"
import PODManagement from "@/components/PODManagement"
import ClientPackDocuments from "@/components/ClientPackDocuments"
import { Download, Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface OrderData {
  id: string
  order_number?: string
  po_number?: string
  supplier?: string
  importer?: string
  status?: string
  cargo_status?: string
  freight_type?: string
  cargo_status_comment?: string
  total_value?: number
  customer_name?: string
  origin?: string
  destination?: string
  created_at: string
  updated_at?: string
  tracking_number?: string | null
  shipping_line?: string
  vessel_name?: string
  // Financial fields (may not exist in all tables)
  commercial_value?: number
  customs_duties?: number
  handling_fees?: number
  shipping_cost?: number
  documentation_fee?: number
  communication_fee?: number
  financial_notes?: string
  // New calculated financial fields (if added to Supabase)
  customs_vat?: number
  total_disbursements?: number
  facility_fee?: number
  agency_fee?: number
  subtotal_amount?: number
  vat_amount?: number
  total_amount?: number
}

export default function OrderDetails({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()

  const [order, setOrder] = useState<OrderData | null>(null)
  const [tempOrder, setTempOrder] = useState<OrderData | null>(null)
  const [customers, setCustomers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFinancialColumns, setHasFinancialColumns] = useState(false)
  // State to track if calculated financial columns exist in Supabase
  const [hasCalculatedFinancialColumns, setHasCalculatedFinancialColumns] = useState(false)

  const [cargoStatusHistory, setCargoStatusHistory] = useState([
    {
      id: "1",
      status: order?.cargo_status || "pending",
      comment: order?.cargo_status_comment || "Order created",
      timestamp: order?.created_at || new Date().toISOString(),
      user: {
        name: "System",
        surname: "User",
      },
    },
  ])

  // Check if financial columns exist in the orders table
  const checkFinancialColumns = async () => {
    try {
      // Try to select financial columns to see if they exist
      const { data, error } = await supabase
        .from("orders")
        .select(
          "commercial_value, customs_duties, handling_fees, shipping_cost, documentation_fee, communication_fee, financial_notes",
        )
        .limit(1)

      if (!error) {
        setHasFinancialColumns(true)
        console.log("Financial columns exist in orders table.")
      } else {
        setHasFinancialColumns(false)
        console.warn("Financial columns do NOT exist in orders table or query failed:", error.message)
      }
      console.log("Final hasFinancialColumns state:", !error)
      // Check for calculated financial columns
      const { data: calculatedData, error: calculatedError } = await supabase
        .from("orders")
        .select("customs_vat, total_disbursements, facility_fee, agency_fee, subtotal_amount, vat_amount, total_amount")
        .limit(1)

      if (!calculatedError) {
        setHasCalculatedFinancialColumns(true)
        console.log("Calculated financial columns exist in orders table.")
      } else {
        setHasCalculatedFinancialColumns(false)
        console.warn(
          "Calculated financial columns do NOT exist in orders table or query failed:",
          calculatedError.message,
        )
      }
    } catch (error) {
      setHasFinancialColumns(false)
      setHasCalculatedFinancialColumns(false)
      console.error("Error during financial columns check:", error)
      console.log("Financial columns check failed, assuming they don't exist.")
    }
  }

  // Fetch order details from Supabase
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First check if financial columns exist
      await checkFinancialColumns()

      const { data, error: supabaseError } = await supabase.from("orders").select("*").eq("id", params.id).single()

      if (supabaseError) {
        throw supabaseError
      }

      if (!data) {
        throw new Error("Order not found")
      }

      console.log("Fetched order details:", data)
      setOrder(data)
      setTempOrder(data)

      // Update cargo status history with real data
      setCargoStatusHistory([
        {
          id: "1",
          status: data.cargo_status || "pending",
          comment: data.cargo_status_comment || "Order created",
          timestamp: data.created_at,
          user: {
            name: "System",
            surname: "User",
          },
        },
      ])
    } catch (error: any) {
      console.error("Error fetching order:", error)
      setError(error.message || "Failed to fetch order details")
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const { data, error: supabaseError } = await supabase.from("customers").select("id, name").order("name")

      if (supabaseError) {
        console.error("Error fetching customers:", supabaseError)
      }

      setCustomers(
        data || [
          { id: 1, name: "Acme Corp" },
          { id: 2, name: "Global Traders" },
          { id: 3, name: "Tech Innovators" },
          { id: 4, name: "Default Customer" },
        ],
      )
    } catch (error) {
      console.error("Error fetching customers:", error)
      // Use fallback data
      setCustomers([
        { id: 1, name: "Acme Corp" },
        { id: 2, name: "Global Traders" },
        { id: 3, name: "Tech Innovators" },
        { id: 4, name: "Default Customer" },
      ])
    }
  }

  useEffect(() => {
    fetchOrderDetails()
    fetchCustomers()
  }, [params.id])

  useEffect(() => {
    if (!isEditing && activeTab === "upload") {
      setActiveTab("documents")
    }
  }, [isEditing, activeTab])

  const handleChange = (field: string, value: string | number | null) => {
    if (tempOrder) {
      setTempOrder((prev) => ({ ...prev!, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempOrder || !order) return

    try {
      setIsSaving(true)

      // First, verify the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", params.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking if order exists:", checkError)
        throw new Error("Failed to verify order exists")
      }

      if (!existingOrder) {
        throw new Error("Order not found. It may have been deleted.")
      }

      // Start with a copy of tempOrder to include all fields by default
      const updateData: Partial<OrderData> = { ...tempOrder }

      // Remove properties that should not be updated or are handled separately
      delete updateData.id // ID is used in the .eq() clause, not for update
      delete updateData.created_at // Creation timestamp should not be updated by client

      // Ensure updated_at is always set to now
      updateData.updated_at = new Date().toISOString()

      // Only add financial fields if they exist in the table
      // This block remains the same as it correctly handles conditional inclusion
      // and calculation of derived financial fields.
      if (hasFinancialColumns) {
        // Explicitly ensure financial_notes is included if hasFinancialColumns is true
        updateData.financial_notes = tempOrder.financial_notes || null

        // Calculate derived financial fields and add them if columns exist
        if (hasCalculatedFinancialColumns) {
          const commercialValue = tempOrder.commercial_value || 0
          const customsDuties = tempOrder.customs_duties || 0
          const customsVAT = commercialValue * 0.15
          const handlingFees = tempOrder.handling_fees || 0
          const shippingCost = tempOrder.shipping_cost || 0
          const documentationFee = tempOrder.documentation_fee || 0
          const communicationFee = tempOrder.communication_fee || 0

          const totalDisbursements =
            customsDuties + customsVAT + handlingFees + shippingCost + documentationFee + communicationFee
          const facilityFee = totalDisbursements * 0.025 // 2.5%
          const agencyFee = totalDisbursements * 0.035 // 3.5%
          const subtotal = totalDisbursements + facilityFee + agencyFee
          const vat = subtotal * 0.15
          const total = subtotal + vat

          updateData.customs_vat = customsVAT
          updateData.total_disbursements = totalDisbursements
          updateData.facility_fee = facilityFee
          updateData.agency_fee = agencyFee
          updateData.subtotal_amount = subtotal
          updateData.vat_amount = vat
          updateData.total_amount = total
        }
      } else {
        // If financial columns don't exist, ensure these are not sent
        delete updateData.commercial_value
        delete updateData.customs_duties
        delete updateData.handling_fees
        delete updateData.shipping_cost
        delete updateData.documentation_fee
        delete updateData.communication_fee
        delete updateData.financial_notes
        delete updateData.customs_vat
        delete updateData.total_disbursements
        delete updateData.facility_fee
        delete updateData.agency_fee
        delete updateData.subtotal_amount
        delete updateData.vat_amount
        delete updateData.total_amount
      }

      console.log("Attempting to update order with data:", updateData)
      console.log("hasFinancialColumns:", hasFinancialColumns)
      console.log("hasCalculatedFinancialColumns:", hasCalculatedFinancialColumns)
      console.log("Update payload for financial_notes:", updateData.financial_notes)

      // Update order in Supabase - Improved error handling
      const { error: updateError, count } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", params.id)
        .select("*", { count: "exact" })

      if (updateError) {
        console.error("Supabase update error details:", updateError) // Log the full error object
        throw updateError
      }

      if (count === 0) {
        throw new Error("No order was updated. This may be due to permissions or the order may have been deleted.")
      }

      // Fetch the updated order separately to ensure we have the latest data
      const { data: updatedOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (fetchError || !updatedOrder) {
        console.error("Error fetching updated order:", fetchError)
        // Don't throw error here, just log it and continue with existing data
        console.log("Continuing with existing order data")
      }

      const finalOrderData = updatedOrder || tempOrder

      console.log("Order updated successfully. Rows affected:", count)

      // Update cargo status history if status changed
      if (order.cargo_status !== tempOrder.cargo_status) {
        const historyEntry = {
          order_id: params.id,
          status: tempOrder.cargo_status || "pending",
          comment: tempOrder.cargo_status_comment || "",
          created_at: new Date().toISOString(),
          user_name: "Current User", // You can replace this with actual user data
        }

        const { error: historyError } = await supabase.from("cargo_status_history").insert(historyEntry)

        if (historyError) {
          console.warn("Failed to create cargo status history:", historyError)
          // Don't throw error here, just log it
        }

        setCargoStatusHistory((prev) => [
          {
            id: Date.now().toString(),
            status: tempOrder.cargo_status || "pending",
            comment: tempOrder.cargo_status_comment || "",
            timestamp: new Date().toISOString(),
            user: {
              name: "Current",
              surname: "User",
            },
          },
          ...prev,
        ])

        // Clear the comment after adding to history
        setTempOrder((prev) => ({ ...prev!, cargo_status_comment: "" }))
      }

      // Update local state with the returned data
      setOrder(finalOrderData)
      setTempOrder(finalOrderData)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Order updated successfully",
      })

      // Refresh the page data to ensure consistency
      await fetchOrderDetails()
    } catch (error: any) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setTempOrder(order)
    setIsEditing(false)
  }

  const handlePaymentReceived = async () => {
    if (!order) return

    try {
      console.log("Marking order as completed:", order.id)

      // First verify the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", params.id)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking if order exists:", checkError)
        throw new Error("Failed to verify order exists")
      }

      if (!existingOrder) {
        throw new Error("Order not found. It may have been deleted.")
      }

      // Update the order status to Completed in Supabase - Improved error handling
      const { error: updateError, count } = await supabase
        .from("orders")
        .update({
          status: "Completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select("*", { count: "exact" })

      if (updateError) {
        console.error("Error updating payment status:", updateError)
        throw updateError
      }

      if (count === 0) {
        throw new Error("No order was updated. This may be due to permissions or the order may have been deleted.")
      }

      // Fetch the updated order separately
      const { data: updatedOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (fetchError || !updatedOrder) {
        console.error("Error fetching updated order:", fetchError)
        throw new Error("Failed to fetch updated order data")
      }

      const finalOrderData = updatedOrder

      console.log("Payment status updated successfully. Rows affected:", count)

      // Update cargo status history
      const historyEntry = {
        order_id: params.id,
        status: "delivered",
        comment: "Payment received and order completed",
        created_at: new Date().toISOString(),
        user_name: "Current User",
      }

      const { error: historyError } = await supabase.from("cargo_status_history").insert(historyEntry)

      if (historyError) {
        console.warn("Failed to create cargo status history:", historyError)
      }

      setCargoStatusHistory((prev) => [
        {
          id: Date.now().toString(),
          status: "delivered",
          comment: "Payment received and order completed",
          timestamp: new Date().toISOString(),
          user: {
            name: "Current",
            surname: "User",
          },
        },
        ...prev,
      ])

      toast({
        title: "Payment Received",
        description: `Order ${order.order_number || order.po_number} has been marked as completed`,
      })
    } catch (error: any) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      })
    }
  }

  const handleTrackShipment = () => {
    if (order?.tracking_number) {
      router.push(`/shipment-tracker/results/${order.tracking_number}`)
    } else {
      toast({
        title: "No Tracking Number",
        description: "This order does not have a tracking number to track.",
        variant: "default",
      })
    }
  }

  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"]

  const exportToExcel = () => {
    const headers = ["Status", "Comment", "Timestamp", "User"]
    const csvData = cargoStatusHistory.map((history) => [
      history.status
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      history.comment || "",
      new Date(history.timestamp).toLocaleString(),
      `${history.user.name} ${history.user.surname}`,
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cargo_status_report_${order?.order_number || order?.po_number || params.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Order Not Found</h2>
          <p className="text-gray-600">{error || "The requested order could not be found."}</p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
            <Button onClick={() => fetchOrderDetails()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order Details: {order.order_number || order.po_number || order.id}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Back to Order List
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Order Information</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePaymentReceived}>
                Payment Received
              </Button>
              <Button
                variant="secondary"
                onClick={handleTrackShipment}
                disabled={!order.tracking_number}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Track Shipment
              </Button>
              {!isEditing && (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Order
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Order Number", key: "order_number", value: order.order_number || "N/A" },
                  { label: "PO Number", key: "po_number", value: order.po_number || "N/A" },
                  { label: "Supplier", key: "supplier", value: order.supplier || "N/A" },
                  { label: "Importer", key: "importer", value: order.importer || "N/A" },
                  { label: "Customer", key: "customer_name", value: order.customer_name || "N/A" },
                  { label: "Origin", key: "origin", value: order.origin || "N/A" },
                  { label: "Destination", key: "destination", value: order.destination || "N/A" },
                  { label: "Tracking Number", key: "tracking_number", value: order.tracking_number || "N/A" },
                  { label: "Order Status", key: "status", value: order.status || "N/A" },
                  { label: "Cargo Status", key: "cargo_status", value: order.cargo_status || "N/A" },
                  { label: "Freight Type", key: "freight_type", value: order.freight_type || "N/A" },
                  { label: "Shipping Line", key: "shipping_line", value: order.shipping_line || "Not specified" },
                  { label: "Vessel Name", key: "vessel_name", value: order.vessel_name || "Not specified" },
                ].map(({ label, key, value }) => (
                  <div key={key} className="space-y-2">
                    <Label className="font-semibold">{label}:</Label>
                    {isEditing ? (
                      key === "freight_type" ? (
                        <Select
                          value={(tempOrder?.[key as keyof OrderData] as string) || ""}
                          onValueChange={(val) => handleChange(key, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select freight type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Air Freight">Air Freight</SelectItem>
                            <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                            <SelectItem value="EXW">EXW</SelectItem>
                            <SelectItem value="FOB">FOB</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : key === "importer" ? (
                        <Select
                          value={tempOrder?.importer || ""}
                          onValueChange={(val) => handleChange("importer", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select importer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "status" ? (
                        <Select value={tempOrder?.status || ""} onValueChange={(val) => handleChange("status", val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "cargo_status" ? (
                        <div className="space-y-2">
                          <Select
                            value={tempOrder?.cargo_status || ""}
                            onValueChange={(val) => handleChange("cargo_status", val)}
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
                          {(tempOrder?.cargo_status === "instruction-sent" ||
                            tempOrder?.cargo_status === "agent-response") && (
                            <Input
                              placeholder="Add comment"
                              value={tempOrder?.cargo_status_comment || ""}
                              onChange={(e) => handleChange("cargo_status_comment", e.target.value)}
                            />
                          )}
                        </div>
                      ) : (
                        <Input
                          value={(tempOrder?.[key as keyof OrderData] as string) || ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )
                    ) : (
                      <p className="text-gray-700 p-2 bg-gray-50 rounded">
                        {value}
                        {key === "cargo_status" &&
                          (order.cargo_status === "instruction-sent" || order.cargo_status === "agent-response") &&
                          order.cargo_status_comment && (
                            <span className="block text-sm text-gray-500 mt-1">
                              Comment: {order.cargo_status_comment}
                            </span>
                          )}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Tabs defaultValue="documents" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="documents" disabled={isEditing}>
                View Documents
              </TabsTrigger>
              {isEditing && <TabsTrigger value="upload">Upload Documents</TabsTrigger>}
              <TabsTrigger value="financials">Order Financials</TabsTrigger>
              <TabsTrigger value="pod">Proof of Delivery</TabsTrigger>
              <TabsTrigger value="cargo-history">Cargo Status Report</TabsTrigger>
              <TabsTrigger
                value="client-pack"
                disabled={isEditing}
                className={`text-white bg-black hover:bg-gray-800 ${activeTab === "client-pack" ? "bg-gray-700" : ""}`}
              >
                Client Pack
              </TabsTrigger>
            </TabsList>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Order Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasFinancialColumns ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Financial columns are not available in the current orders table.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Run the financial columns migration to enable this feature.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Financial Form - Editable */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commercialValue">Commercial Value (R)</Label>
                          <Input
                            id="commercialValue"
                            type="number"
                            step="0.01"
                            value={tempOrder?.commercial_value || 0}
                            onChange={(e) => handleChange("commercial_value", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customsDuties">Customs Duties (R)</Label>
                          <Input
                            id="customsDuties"
                            type="number"
                            step="0.01"
                            value={tempOrder?.customs_duties || 0}
                            onChange={(e) => handleChange("customs_duties", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customsVAT">Customs VAT (15% of commercial value)</Label>
                          <Input
                            id="customsVAT"
                            type="text"
                            value={`R ${((tempOrder?.commercial_value || 0) * 0.15).toFixed(2)}`}
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
                            value={tempOrder?.handling_fees || 0}
                            onChange={(e) => handleChange("handling_fees", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shippingCost">Shipping Cost (R)</Label>
                          <Input
                            id="shippingCost"
                            type="number"
                            step="0.01"
                            value={tempOrder?.shipping_cost || 0}
                            onChange={(e) => handleChange("shipping_cost", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentationFee">
                            Documentation Fee ({tempOrder?.freight_type || "Air"}) (R)
                          </Label>
                          <Input
                            id="documentationFee"
                            type="number"
                            step="0.01"
                            value={tempOrder?.documentation_fee || 0}
                            onChange={(e) => handleChange("documentation_fee", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="communicationFee">
                            Communication Fee ({tempOrder?.freight_type || "Air"}) (R)
                          </Label>
                          <Input
                            id="communicationFee"
                            type="number"
                            step="0.01"
                            value={tempOrder?.communication_fee || 0}
                            onChange={(e) => handleChange("communication_fee", Number.parseFloat(e.target.value))}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-gray-50" : ""}
                          />
                        </div>
                      </div>

                      {/* Notes - Full Width */}
                      <div className="space-y-2">
                        <Label htmlFor="financialNotes">Notes</Label>
                        {isEditing ? (
                          <textarea
                            id="financialNotes"
                            value={tempOrder?.financial_notes || ""}
                            onChange={(e) => handleChange("financial_notes", e.target.value)}
                            className="min-h-[100px] w-full p-3 border rounded-md resize-y"
                          />
                        ) : (
                          <div className="min-h-[100px] p-3 bg-gray-50 border rounded-md">
                            {order?.financial_notes || "No financial notes available"}
                          </div>
                        )}
                      </div>

                      {/* Summary Section */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          {(() => {
                            const commercialValue = tempOrder?.commercial_value || 0
                            const customsDuties = tempOrder?.customs_duties || 0
                            const customsVAT = commercialValue * 0.15
                            const handlingFees = tempOrder?.handling_fees || 0
                            const shippingCost = tempOrder?.shipping_cost || 0
                            const documentationFee = tempOrder?.documentation_fee || 0
                            const communicationFee = tempOrder?.communication_fee || 0

                            const totalDisbursements =
                              customsDuties +
                              customsVAT +
                              handlingFees +
                              shippingCost +
                              documentationFee +
                              communicationFee
                            const facilityFee = totalDisbursements * 0.025 // 2.5%
                            const agencyFee = totalDisbursements * 0.035 // 3.5%
                            const subtotal = totalDisbursements + facilityFee + agencyFee
                            const vat = subtotal * 0.15
                            const total = subtotal + vat

                            return (
                              <>
                                <div className="flex justify-between">
                                  <span>Total Disbursements:</span>
                                  <span>R {totalDisbursements.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Facility Fee (2.5%):</span>
                                  <span>R {facilityFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Agency Fee (3.5%):</span>
                                  <span>R {agencyFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span>Subtotal:</span>
                                  <span>R {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>VAT (15%):</span>
                                  <span>R {vat.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                  <span>Total:</span>
                                  <span className="text-green-600">R {total.toFixed(2)}</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <DocumentManagement orderId={order.id} isEditing={false} />
            </TabsContent>
            {isEditing && (
              <TabsContent value="upload">
                <DocumentManagement orderId={order.id} isEditing={true} />
              </TabsContent>
            )}
            <TabsContent value="pod">
              <PODManagement orderId={params.id} />
            </TabsContent>
            <TabsContent value="cargo-history">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-end mb-4 px-1">
                    <Button
                      size="sm"
                      onClick={exportToExcel}
                      className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export to Excel</span>
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium w-[140px]">Status Type</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Comment</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">User</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargoStatusHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                              No cargo status changes recorded yet.
                            </td>
                          </tr>
                        ) : (
                          cargoStatusHistory.map((history, index) => (
                            <tr key={history.id} className="border-b">
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    index === 0
                                      ? "bg-primary/10 text-primary ring-primary/20"
                                      : "bg-muted/50 text-muted-foreground ring-muted/20"
                                  }`}
                                >
                                  {index === 0 ? "Current Status" : "Previous Status"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className={index === 0 ? "font-medium text-primary" : "text-muted-foreground"}>
                                    {history.status
                                      .split("-")
                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(" ")}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{history.comment || "No comment"}</td>
                              <td className="p-4 text-muted-foreground">
                                {history.user.name} {history.user.surname}
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {new Date(history.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="client-pack">
              <ClientPackDocuments orderId={params.id} freightType={order.freight_type || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
