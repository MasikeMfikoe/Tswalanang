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
import EstimateGeneration from "@/components/EstimateGeneration"
import PODManagement from "@/components/PODManagement"
import ClientPackDocuments from "@/components/ClientPackDocuments"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function OrderDetails({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()

  const [order, setOrder] = useState({
    id: params.id,
    poNumber: "P0001",
    supplier: "Supplier A",
    importer: "Importer X",
    status: "In Progress",
    cargoStatus: "In Transit",
    freightType: "",
    cargoStatusComment: "",
    documents: [],
  })

  const [tempOrder, setTempOrder] = useState({
    id: params.id,
    poNumber: "P0001",
    supplier: "Supplier A",
    importer: "Importer X",
    status: "In Progress",
    cargoStatus: "In Transit",
    freightType: "",
    cargoStatusComment: "",
    documents: [],
  })

  const [customers, setCustomers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")

  const [cargoStatusHistory, setCargoStatusHistory] = useState([
    {
      id: "4",
      status: "at-destination",
      comment: "Cargo arrived at destination port",
      timestamp: new Date().toISOString(),
      user: {
        name: "John",
        surname: "Smith",
      },
    },
    {
      id: "3",
      status: "in-transit",
      comment: "Cargo is in transit",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Sarah",
        surname: "Johnson",
      },
    },
    {
      id: "2",
      status: "cargo-departed",
      comment: "Cargo has departed from origin",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Mike",
        surname: "Wilson",
      },
    },
    {
      id: "1",
      status: "instruction-sent",
      comment: "Initial instruction sent to agent",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Emma",
        surname: "Davis",
      },
    },
  ])

  useEffect(() => {
    if (!isEditing && activeTab === "upload") {
      setActiveTab("documents")
    }
  }, [isEditing, activeTab])

  useEffect(() => {
    setCustomers([
      { id: 1, name: "Acme Corp" },
      { id: 2, name: "Global Traders" },
      { id: 3, name: "Tech Innovators" },
      { id: 4, name: "Importer X" },
    ])
  }, [])

  const handleChange = (field: string, value: string) => {
    setTempOrder((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (order.cargoStatus !== tempOrder.cargoStatus) {
      setCargoStatusHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          status: tempOrder.cargoStatus,
          comment: tempOrder.cargoStatusComment || "",
          timestamp: new Date().toISOString(),
          user: {
            name: user?.name || "Unknown",
            surname: user?.surname || "User",
          },
        },
      ])
      tempOrder.cargoStatusComment = ""
    }
    console.log("Updating order:", tempOrder)
    setOrder(tempOrder)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempOrder(order)
    setIsEditing(false)
  }

  const handlePaymentReceived = () => {
    // Update the order status to Completed
    setOrder((prev) => ({ ...prev, status: "Completed" }))
    setTempOrder((prev) => ({ ...prev, status: "Completed" }))

    // Add to cargo status history
    setCargoStatusHistory((prev) => [
      {
        id: Date.now().toString(),
        status: "payment-received",
        comment: "Payment received and order completed",
        timestamp: new Date().toISOString(),
        user: {
          name: user?.name || "Unknown",
          surname: user?.surname || "User",
        },
      },
      ...prev,
    ])

    // Show success notification using toast
    toast({
      title: "Payment Received",
      description: `Order ${params.id} has been marked as completed`,
      variant: "default",
    })
  }

  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"]

  const exportToExcel = () => {
    const headers = ["Status", "Comment", "Timestamp"]
    const csvData = cargoStatusHistory.map((history) => [
      history.status
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      history.comment || "",
      new Date(history.timestamp).toLocaleString(),
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cargo_status_report_${order.poNumber}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const user = { name: "Test", surname: "User" }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order Details: {order.poNumber}</h1>
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
              <Button variant="outline" onClick={() => handlePaymentReceived()}>
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
              <ul className="space-y-2">
                {[
                  { label: "PO Number", key: "poNumber", value: order.poNumber },
                  { label: "Supplier", key: "supplier", value: order.supplier },
                  { label: "Importer", key: "importer", value: order.importer },
                  { label: "Order Status", key: "status", value: order.status },
                  { label: "Cargo Status", key: "cargoStatus", value: order.cargoStatus },
                  { label: "Freight Type", key: "freightType", value: order.freightType },
                ].map(({ label, key, value }) => (
                  <li key={key} className="flex items-center space-x-3">
                    <Label className="font-semibold w-32">{label}:</Label>
                    {isEditing ? (
                      key === "freightType" ? (
                        <Select value={tempOrder.freightType} onValueChange={(val) => handleChange("freightType", val)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select freight type">{tempOrder.freightType}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Air Freight">Air Freight</SelectItem>
                            <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                            <SelectItem value="EXW">EXW</SelectItem>
                            <SelectItem value="FOB">FOB</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : key === "importer" ? (
                        <Select value={tempOrder.importer} onValueChange={(val) => handleChange("importer", val)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select importer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.name}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : key === "status" ? (
                        <Select value={tempOrder.status} onValueChange={(val) => handleChange("status", val)}>
                          <SelectTrigger className="w-48">
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
                      ) : key === "cargoStatus" ? (
                        <div className="space-y-2">
                          <Select
                            value={tempOrder.cargoStatus}
                            onValueChange={(val) => handleChange("cargoStatus", val)}
                          >
                            <SelectTrigger className="w-48">
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
                          {(tempOrder.cargoStatus === "instruction-sent" ||
                            tempOrder.cargoStatus === "agent-response") && (
                            <Input
                              className="w-48"
                              placeholder="Add comment"
                              value={tempOrder.cargoStatusComment || ""}
                              onChange={(e) => handleChange("cargoStatusComment", e.target.value)}
                            />
                          )}
                        </div>
                      ) : (
                        <Input
                          className="w-48"
                          value={tempOrder[key as keyof typeof order]}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )
                    ) : (
                      <p className="text-gray-700">
                        {value}
                        {key === "cargoStatus" &&
                          (order.cargoStatus === "instruction-sent" || order.cargoStatus === "agent-response") &&
                          order.cargoStatusComment && (
                            <span className="block text-sm text-gray-500 mt-1">
                              Comment: {order.cargoStatusComment}
                            </span>
                          )}
                      </p>
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

        <div className="space-y-4">
          <Tabs defaultValue="documents" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="documents" disabled={isEditing}>
                View Documents
              </TabsTrigger>
              {isEditing && <TabsTrigger value="upload">Upload Documents</TabsTrigger>}
              <TabsTrigger value="estimate">Estimate</TabsTrigger>
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
            <TabsContent value="estimate">
              <div className="pr-4 text-[15px]">
                <div className="[&_span:first-child]:font-bold [&_.flex.justify-between]:gap-1">
                  <EstimateGeneration orderId={order.id} freightType={order.freightType} />
                </div>
              </div>
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
                        </tr>
                      </thead>
                      <tbody>
                        {cargoStatusHistory.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
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
              <ClientPackDocuments orderId={params.id} freightType={order.freightType} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
