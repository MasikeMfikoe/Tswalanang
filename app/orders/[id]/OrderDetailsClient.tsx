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
import EDISubmissionStatus from "@/components/EDISubmissionStatus"
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
  commercial_value?: number
  customs_duties?: number
  handling_fees?: number
  shipping_cost?: number
  documentation_fee?: number
  communication_fee?: number
  financial_notes?: string
  customs_vat?: number
  total_disbursements?: number
  facility_fee?: number
  agency_fee?: number
  subtotal_amount?: number
  vat_amount?: number
  total_amount?: number
}

export default function OrderDetailsClient({ id }: { id: string }) {
  const { toast } = useToast()
  const router = useRouter()

  const [order, setOrder] = useState<OrderData | null>(null)
  const [tempOrder, setTempOrder] = useState<OrderData | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFinancialColumns, setHasFinancialColumns] = useState(false)
  const [hasCalculatedFinancialColumns, setHasCalculatedFinancialColumns] = useState(false)

  const [cargoStatusHistory, setCargoStatusHistory] = useState([
    {
      id: "1",
      status: order?.cargo_status || "pending",
      comment: order?.cargo_status_comment || "Order created",
      timestamp: order?.created_at || new Date().toISOString(),
      user: { name: "System", surname: "User" },
    },
  ])

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("[v0] Fetching order details via API for ID:", id)

      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to fetch order details")

      console.log("[v0] Successfully fetched order details via API")
      setOrder(data.order)
      setTempOrder(data.order)
      setHasFinancialColumns(data.hasFinancialColumns)
      setHasCalculatedFinancialColumns(data.hasCalculatedFinancialColumns)

      setCargoStatusHistory([
        {
          id: "1",
          status: data.order.cargo_status || "pending",
          comment: data.order.cargo_status_comment || "Order created",
          timestamp: data.order.created_at,
          user: { name: "System", surname: "User" },
        },
      ])
    } catch (e: any) {
      console.error("[v0] Error fetching order:", e)
      setError(e.message || "Failed to fetch order details")
      toast({ title: "Error", description: "Failed to load order details", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      console.log("[v0] 🔄 Fetching customers from API...")
      const response = await fetch("/api/customers")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()
      console.log("[v0] ✅ Customers API response:", result)

      if (result.success && result.data) {
        const customerOptions = result.data.map((c: any) => ({
          id: c.id,
          name: c.name || c.company_name || `Customer ${c.id}`,
        }))
        setCustomers(customerOptions)
        console.log("[v0] ✅ Customers set successfully:", customerOptions.length, "customers")
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (e) {
      console.error("[v0] ❌ Error fetching customers:", e)
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
  }, [id])

  useEffect(() => {
    if (!isEditing && activeTab === "upload") setActiveTab("documents")
  }, [isEditing, activeTab])

  const handleChange = (field: string, value: string | number | null) => {
    if (tempOrder) setTempOrder((prev) => ({ ...prev!, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempOrder || !order) return

    try {
      setIsSaving(true)

      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", id)
        .maybeSingle()

      if (checkError) throw new Error("Failed to verify order exists")
      if (!existingOrder) throw new Error("Order not found. It may have been deleted.")

      const updateData: Partial<OrderData> = { ...tempOrder }
      delete updateData.id
      delete updateData.created_at
      updateData.updated_at = new Date().toISOString()

      if (hasFinancialColumns) {
        updateData.financial_notes = tempOrder.financial_notes || null
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
          const facilityFee = totalDisbursements * 0.025
          const agencyFee = totalDisbursements * 0.035
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

      const { error: updateError, count } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select("*", { count: "exact" })

      if (updateError) throw updateError
      if (count === 0) throw new Error("No order was updated. It may have been deleted or you lack permission.")

      const { data: updatedOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError || !updatedOrder) console.warn("Could not fetch updated order; continuing with local data")

      const finalOrderData = updatedOrder || tempOrder

      if (order.cargo_status !== tempOrder.cargo_status) {
        const historyEntry = {
          order_id: id,
          status: tempOrder.cargo_status || "pending",
          comment: tempOrder.cargo_status_comment || "",
          created_at: new Date().toISOString(),
          user_name: "Current User",
        }
        const { error: historyError } = await supabase.from("cargo_status_history").insert(historyEntry)
        if (historyError) console.warn("Failed to create cargo status history:", historyError)

        setCargoStatusHistory((prev) => [
          {
            id: Date.now().toString(),
            status: tempOrder.cargo_status || "pending",
            comment: tempOrder.cargo_status_comment || "",
            timestamp: new Date().toISOString(),
            user: { name: "Current", surname: "User" },
          },
          ...prev,
        ])
        setTempOrder((prev) => ({ ...prev!, cargo_status_comment: "" }))
      }

      setOrder(finalOrderData)
      setTempOrder(finalOrderData)
      setIsEditing(false)

      toast({ title: "Success", description: "Order updated successfully" })
      await fetchOrderDetails()
    } catch (e: any) {
      console.error("Error updating order:", e)
      toast({ title: "Error", description: e.message || "Failed to update order", variant: "destructive" })
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
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", id)
        .maybeSingle()
      if (checkError) throw new Error("Failed to verify order exists")
      if (!existingOrder) throw new Error("Order not found. It may have been deleted.")

      const { error: updateError, count } = await supabase
        .from("orders")
        .update({ status: "Completed", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*", { count: "exact" })

      if (updateError) throw updateError
      if (count === 0) throw new Error("No order was updated.")

      const { data: updatedOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()
      if (fetchError || !updatedOrder) throw new Error("Failed to fetch updated order data")

      const historyEntry = {
        order_id: id,
        status: "delivered",
        comment: "Payment received and order completed",
        created_at: new Date().toISOString(),
        user_name: "Current User",
      }
      const { error: historyError } = await supabase.from("cargo_status_history").insert(historyEntry)
      if (historyError) console.warn("Failed to create cargo status history:", historyError)

      setCargoStatusHistory((prev) => [
        {
          id: Date.now().toString(),
          status: "delivered",
          comment: "Payment received and order completed",
          timestamp: new Date().toISOString(),
          user: { name: "Current", surname: "User" },
        },
        ...prev,
      ])

      toast({
        title: "Payment Received",
        description: `Order ${order.order_number || order.po_number} has been marked as completed`,
      })
    } catch (e: any) {
      console.error("Error updating payment status:", e)
      toast({ title: "Error", description: e.message || "Failed to update payment status", variant: "destructive" })
    }
  }

  const handleTrackShipment = () => {
    if (order?.tracking_number) {
      router.push(`/shipment-tracker/results/${order.tracking_number}`)
    } else {
      toast({ title: "No Tracking Number", description: "This order does not have a tracking number to track." })
    }
  }

  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"]

  const exportToExcel = () => {
    if (typeof window === "undefined") return
    try {
      const headers = ["Status", "Comment", "Timestamp", "User"]
      const csvData = cargoStatusHistory.map((h) => [
        h.status.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        h.comment || "",
        new Date(h.timestamp).toLocaleString(),
        `${h.user.name} ${h.user.surname}`,
      ])
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `cargo_status_report_${order?.order_number || order?.po_number || id}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Error exporting to Excel:", e)
      toast({ title: "Error", description: "Failed to export cargo status report", variant: "destructive" })
    }
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
            <Button variant="outline" onClick={() => router.push("/orders")}>Back to Orders</Button>
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
            <Button variant="outline" onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            <Button variant="outline" onClick={() => router.push("/orders")}>Back to Order List</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Order Information</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePaymentReceived}>Payment Received</Button>
              <Button variant="secondary" onClick={handleTrackShipment} disabled={!order.tracking_number} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Track Shipment
              </Button>
              {!isEditing && <Button type="button" onClick={() => setIsEditing(true)}>Edit Order</Button>}
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
                ].map(({ label, key, value }) => (
                  <div key={key} className="space-y-2">
                    <Label className="font-semibold">{label}:</Label>
                    {isEditing ? (
                      key === "freight_type" ? (
                        <Select value={(tempOrder?.[key as keyof OrderData] as string) || ""} onValueChange={(val) => handleChange(key, val)}>
                          <SelectTrigger><SelectValue placeholder="Select freight type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Air Freight">Air Freight</SelectItem>
                            <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                            <SelectItem value="EXW">EXW</SelectItem>
                            <SelectItem value="FOB">FOB</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : key === "importer" ? (
                        <Select value={tempOrder?.importer || ""} onValueChange={(val) => handleChange("importer", val)}>
                          <SelectTrigger><SelectValue placeholder="Select importer" /></SelectTrigger>
                          <SelectContent>
                            {customers.map((c: any) => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "status" ? (
                        <Select value={tempOrder?.status || ""} onValueChange={(val) => handleChange("status", val)}>
                          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            {["Pending", "In Progress", "Completed", "Cancelled"].map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "cargo_status" ? (
                        <div className="space-y-2">
                          <Select value={tempOrder?.cargo_status || ""} onValueChange={(val) => handleChange("cargo_status", val)}>
                            <SelectTrigger><SelectValue placeholder="Select cargo status" /></SelectTrigger>
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
                          {(tempOrder?.cargo_status === "instruction-sent" || tempOrder?.cargo_status === "agent-response") && (
                            <Input
                              placeholder="Add comment"
