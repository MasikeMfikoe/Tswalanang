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
import { Download, Loader2 } from "lucide-react"
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
  // Financial fields
  commercial_value?: number
  customs_duties?: number
  handling_fees?: number
  shipping_cost?: number
  documentation_fee?: number
  communication_fee?: number
  financial_notes?: string
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

  // Fetch order details from Supabase
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

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

  const handleChange = (field: string, value: string) => {
    if (tempOrder) {
      setTempOrder((prev) => ({ ...prev!, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempOrder || !order) return

    try {
      setIsSaving(true)

      // Update order in Supabase
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          order_number: tempOrder.order_number,
          po_number: tempOrder.po_number,
          supplier: tempOrder.supplier,
          importer: tempOrder.importer,
          status: tempOrder.status,
          cargo_status: tempOrder.cargo_status,
          freight_type: tempOrder.freight_type,
          cargo_status_comment: tempOrder.cargo_status_comment,
          customer_name: tempOrder.customer_name,
          origin: tempOrder.origin,
          destination: tempOrder.destination,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) {
        throw updateError
      }

      // Update cargo status history if status changed
      if (order.cargo_status !== tempOrder.cargo_status) {
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

      setOrder(tempOrder)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Order updated successfully",
      })
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
      // Update the order status to Completed in Supabase
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "Completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setOrder((prev) => (prev ? { ...prev, status: "Completed" } : null))
      setTempOrder((prev) => (prev ? { ...prev, status: "Completed" } : null))

      // Add to cargo status history
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
        description: "Failed to update payment status",
        variant: "destructive",
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
                  { label: "Order Status", key: "status", value: order.status || "N/A" },
                  { label: "Cargo Status", key: "cargo_status", value: order.cargo_status || "N/A" },
                  { label: "Freight Type", key: "freight_type", value: order.freight_type || "N/A" },
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

            <TabsContent value="documents">
              <DocumentManagement orderId={order.id} isEditing={false} />
            </TabsContent>
            {isEditing && (
              <TabsContent value="upload">
                <DocumentManagement orderId={order.id} isEditing={true} />
              </TabsContent>
            )}
            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Order Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Financial Form - Read Only */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commercialValue">Commercial Value (R)</Label>
                        <Input
                          id="commercialValue"
                          type="text"
                          value={`R ${(order?.commercial_value || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customsDuties">Customs Duties (R)</Label>
                        <Input
                          id="customsDuties"
                          type="text"
                          value={`R ${(order?.customs_duties || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customsVAT">Customs VAT (15% of commercial value)</Label>
                        <Input
                          id="customsVAT"
                          type="text"
                          value={`R ${((order?.commercial_value || 0) * 0.15).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="handlingFees">Handling Fees (R)</Label>
                        <Input
                          id="handlingFees"
                          type="text"
                          value={`R ${(order?.handling_fees || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCost">Shipping Cost (R)</Label>
                        <Input
                          id="shippingCost"
                          type="text"
                          value={`R ${(order?.shipping_cost || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentationFee">Documentation Fee ({order?.freight_type || "Air"}) (R)</Label>
                        <Input
                          id="documentationFee"
                          type="text"
                          value={`R ${(order?.documentation_fee || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="communicationFee">Communication Fee ({order?.freight_type || "Air"}) (R)</Label>
                        <Input
                          id="communicationFee"
                          type="text"
                          value={`R ${(order?.communication_fee || 0).toFixed(2)}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Notes - Full Width */}
                    <div className="space-y-2">
                      <Label htmlFor="financialNotes">Notes</Label>
                      <div className="min-h-[100px] p-3 bg-gray-50 border rounded-md">
                        {order?.financial_notes || "No financial notes available"}
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {(() => {
                          const commercialValue = order?.commercial_value || 0
                          const customsDuties = order?.customs_duties || 0
                          const customsVAT = commercialValue * 0.15
                          const handlingFees = order?.handling_fees || 0
                          const shippingCost = order?.shipping_cost || 0
                          const documentationFee = order?.documentation_fee || 0
                          const communicationFee = order?.communication_fee || 0

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
                </CardContent>
              </Card>
            </TabsContent>
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
