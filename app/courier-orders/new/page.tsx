"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { emailService } from "@/lib/email-service"
import { generateSecureToken } from "@/lib/qr-code-utils"
import { supabase } from "@/lib/supabase"
import { toast } from "@/lib/toast"
import { useAuth } from "@/contexts/AuthContext"
import { AuditLogger } from "@/lib/audit-logger"

export default function NewCourierOrderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    orderDate: "",
    poNumber: "",
    waybillNo: "",
    accountNo: "",

    // From details
    fromStreetAddress: "",
    fromSuburb: "",
    fromCity: "",
    fromCountry: "",
    fromPostalCode: "",
    fromSender: "",
    fromTel: "",
    fromEmail: "",

    // To details
    toStreetAddress: "",
    toSuburb: "",
    toCity: "",
    toCountry: "",
    toPostalCode: "",
    toReceiver: "",
    toTel: "",
    toEmail: "",

    // Service type
    overnightExpress: false,
    sameDayExpress: false,
    roadFreight: false,
    economy: false,
    nextDay: false,

    // Package details
    items: [
      {
        no: 1,
        description: "",
        dimensions: "",
        volKgs: "",
        massKgs: "",
      },
    ],

    specialInstructions: "",
    sendersName: "",
    sendersDate: "",
    receiversName: "",
    receiversDate: "",

    // Email notifications
    enableElectronicDeliveryReceipt: false,
    notifyRecipient: false,
    sendConfirmationToAdmin: false,
    notifySenderOnCreate: false,
    notifySenderOnConfirm: false,
  })

  const [emailPreview, setEmailPreview] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [columnsExist, setColumnsExist] = useState({
    checked: false,
    hasNewColumns: false,
  })

  // Check if the new columns exist in the database
  useEffect(() => {
    const checkColumns = async () => {
      try {
        // Try to select a row with the new columns to see if they exist
        const { error } = await supabase
          .from("courier_orders")
          .select("order_date, senders_name")
          .limit(1)
          .maybeSingle()

        // If there's no error, the columns exist
        setColumnsExist({
          checked: true,
          hasNewColumns: !error,
        })
      } catch (error) {
        console.error("Error checking columns:", error)
        setColumnsExist({
          checked: true,
          hasNewColumns: false,
        })
      }
    }

    checkColumns()
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      if (field === "enableElectronicDeliveryReceipt") {
        newData.notifyRecipient = value
        newData.sendConfirmationToAdmin = value
        newData.notifySenderOnCreate = value
        newData.notifySenderOnConfirm = value
      }

      return newData
    })
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          no: prev.items.length + 1,
          description: "",
          dimensions: "",
          volKgs: "",
          massKgs: "",
        },
      ],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fromSender || !formData.toReceiver) {
      toast.error("Sender and receiver information is required")
      return
    }

    setIsSubmitting(true)

    try {
      // Base courier order data that works with the default table structure
      const courierOrderData: any = {
        waybill_no: formData.waybillNo || `WB${Date.now()}`,
        po_number: formData.poNumber,
        sender: formData.fromSender,
        receiver: formData.toReceiver,
        from_location: `${formData.fromStreetAddress}, ${formData.fromSuburb}, ${formData.fromCity}, ${formData.fromCountry}`,
        to_location: `${formData.toStreetAddress}, ${formData.toSuburb}, ${formData.toCity}, ${formData.toCountry}`,
        status: "pending",
        service_type: getSelectedServiceType(),
        special_instructions: formData.specialInstructions,

        // Electronic delivery receipt fields
        enable_electronic_delivery_receipt: formData.enableElectronicDeliveryReceipt,
        notify_recipient: formData.notifyRecipient,
        send_confirmation_to_admin: formData.sendConfirmationToAdmin,
        recipient_email: formData.toEmail,

        // Sender notification fields
        sender_email: formData.fromEmail,
        notify_sender_on_create: formData.notifySenderOnCreate,
        notify_sender_on_confirm: formData.notifySenderOnConfirm,

        // Contact details as JSONB
        contact_details: {
          sender: {
            name: formData.fromSender,
            phone: formData.fromTel,
            email: formData.fromEmail,
            address: {
              street: formData.fromStreetAddress,
              suburb: formData.fromSuburb,
              city: formData.fromCity,
              country: formData.fromCountry,
              postal_code: formData.fromPostalCode,
            },
          },
          receiver: {
            name: formData.toReceiver,
            phone: formData.toTel,
            email: formData.toEmail,
            address: {
              street: formData.toStreetAddress,
              suburb: formData.toSuburb,
              city: formData.toCity,
              country: formData.toCountry,
              postal_code: formData.toPostalCode,
            },
          },
        },

        // Account details
        account_details: {
          account_number: formData.accountNo,
        },
      }

      // Only add the new columns if they exist in the database
      if (columnsExist.hasNewColumns) {
        // Format dates for PostgreSQL
        const formatDate = (dateString: string) => {
          return dateString ? dateString : null
        }

        // Add the new columns
        courierOrderData.order_date = formatDate(formData.orderDate)
        courierOrderData.senders_name = formData.sendersName
        courierOrderData.senders_date = formatDate(formData.sendersDate)
        courierOrderData.receivers_name = formData.receiversName
        courierOrderData.receivers_date = formatDate(formData.receiversDate)
      } else {
        // Store these fields in the contact_details JSONB as a fallback
        courierOrderData.contact_details.order_date = formData.orderDate
        courierOrderData.contact_details.senders_name = formData.sendersName
        courierOrderData.contact_details.senders_date = formData.sendersDate
        courierOrderData.contact_details.receivers_name = formData.receiversName
        courierOrderData.contact_details.receivers_date = formData.receiversDate
      }

      // Save courier order to Supabase
      const { data: courierOrder, error: orderError } = await supabase
        .from("courier_orders")
        .insert([courierOrderData])
        .select()
        .single()

      if (orderError) {
        console.error("Error creating courier order:", orderError)
        toast.error("Error creating courier order: " + orderError.message)
        return
      }

      // Log courier order creation
      if (user && courierOrder) {
        await AuditLogger.logCourierOrderCreated(user.id, courierOrder.id, {
          waybill_no: courierOrder.waybill_no,
          sender: courierOrder.sender,
          receiver: courierOrder.receiver,
          service_type: courierOrder.service_type,
        })
      }

      // Save courier order items
      if (formData.items && formData.items.length > 0) {
        const itemsData = formData.items.map((item) => ({
          courier_order_id: courierOrder.id,
          description: item.description,
          dimensions: item.dimensions,
          vol_kgs: Number.parseFloat(item.volKgs) || 0,
          mass_kgs: Number.parseFloat(item.massKgs) || 0,
        }))

        const { error: itemsError } = await supabase.from("courier_order_items").insert(itemsData)

        if (itemsError) {
          console.error("Error creating courier order items:", itemsError)
          // Continue anyway, items are optional
        }
      }

      // Create initial tracking event
      const { error: trackingError } = await supabase.from("tracking_events").insert([
        {
          courier_order_id: courierOrder.id,
          status: "Order Created",
          location: courierOrderData.from_location,
          notes: "Courier order created successfully",
        },
      ])

      if (trackingError) {
        console.error("Error creating tracking event:", trackingError)
        // Continue anyway
      }

      console.log("Courier order created successfully:", courierOrder)
      toast.success("Courier order created successfully!")

      // Navigate back to courier orders page after submission
      router.push("/courier-orders")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to get selected service type
  const getSelectedServiceType = () => {
    if (formData.overnightExpress) return "overnight-express"
    if (formData.sameDayExpress) return "same-day-express"
    if (formData.roadFreight) return "road-freight"
    if (formData.economy) return "economy"
    if (formData.nextDay) return "next-day"
    return "standard"
  }

  // Add a new function to preview sender emails
  const handlePreviewSenderEmail = async (type: "created" | "confirmed") => {
    try {
      if (type === "created") {
        // Generate a temporary token for the preview
        const tempToken = generateSecureToken("preview", 1)

        // Generate email preview for sender order created
        const preview = await emailService.generateSenderOrderCreatedEmailPreview({
          orderId: formData.waybillNo || "WB12345",
          waybillNo: formData.waybillNo || "WB12345",
          senderName: formData.sendersName || "Sender",
          senderEmail: formData.fromEmail || "sender@example.com",
          recipientName: formData.receiversName || "Recipient",
          recipientCompany: formData.toReceiver || "Recipient Company",
          estimatedDelivery: formData.orderDate || "2023-05-15",
          trackingUrl: "#",
          companyName: "TSW Smartlog",
        })

        setEmailPreview(preview)
        setIsPreviewOpen(true)
      } else {
        // Generate email preview for sender delivery confirmed
        const preview = await emailService.generateSenderDeliveryConfirmedEmailPreview({
          orderId: formData.waybillNo || "WB12345",
          waybillNo: formData.waybillNo || "WB12345",
          senderName: formData.sendersName || "Sender",
          senderEmail: formData.fromEmail || "sender@example.com",
          recipientName: formData.receiversName || "Recipient",
          recipientDesignation: "Manager",
          deliveryTimestamp: new Date().toISOString(),
          signatureImageUrl: "/handwritten-agreement.png",
          deliveryProofUrl: "#",
          companyName: "TSW Smartlog",
        })

        setEmailPreview(preview)
        setIsPreviewOpen(true)
      }
    } catch (error) {
      console.error("Error generating email preview:", error)
    }
  }

  const handlePreviewEmail = async () => {
    try {
      // Generate a temporary token for the preview
      const tempToken = generateSecureToken("preview", 1)

      // Generate email preview
      const preview = await emailService.generateDeliveryLinkEmailPreview({
        orderId: formData.waybillNo || "WB12345",
        recipientName: formData.receiversName || "Recipient",
        recipientEmail: formData.toEmail || "recipient@example.com",
        senderName: formData.fromSender || "Sender",
        companyName: "TSW Smartlog",
        estimatedDelivery: formData.orderDate || "2023-05-15",
        token: tempToken,
      })

      setEmailPreview(preview)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error generating email preview:", error)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Courier Order</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/courier-orders")}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </div>

      {columnsExist.checked && !columnsExist.hasNewColumns && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Update Required</AlertTitle>
          <AlertDescription>
            Some columns are missing in your database. Please run the SQL migration to add the missing columns. Your
            order will still be saved, but some fields will be stored in the contact_details JSON field instead.
          </AlertDescription>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Order Information */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="orderDate">Order Date:</Label>
            <Input
              type="date"
              id="orderDate"
              value={formData.orderDate}
              onChange={(e) => handleChange("orderDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="poNumber">PO NUMBER:</Label>
            <Input id="poNumber" value={formData.poNumber} onChange={(e) => handleChange("poNumber", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="waybillNo">Waybill No:</Label>
            <Input
              id="waybillNo"
              value={formData.waybillNo}
              onChange={(e) => handleChange("waybillNo", e.target.value)}
              placeholder="Auto-generated if empty"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="accountNo">Account No:</Label>
          <Input
            id="accountNo"
            className="max-w-xs"
            value={formData.accountNo}
            onChange={(e) => handleChange("accountNo", e.target.value)}
          />
        </div>

        {/* From and To Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* From Section */}
          <div className="space-y-4">
            <div className="bg-black text-white p-2">From</div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fromStreetAddress">Street Address</Label>
                <Input
                  id="fromStreetAddress"
                  value={formData.fromStreetAddress}
                  onChange={(e) => handleChange("fromStreetAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromSuburb">Suburb</Label>
                  <Input
                    id="fromSuburb"
                    value={formData.fromSuburb}
                    onChange={(e) => handleChange("fromSuburb", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fromCity">City</Label>
                  <Input
                    id="fromCity"
                    value={formData.fromCity}
                    onChange={(e) => handleChange("fromCity", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromCountry">Country</Label>
                  <Input
                    id="fromCountry"
                    value={formData.fromCountry}
                    onChange={(e) => handleChange("fromCountry", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fromPostalCode">Postal Code</Label>
                  <Input
                    id="fromPostalCode"
                    value={formData.fromPostalCode}
                    onChange={(e) => handleChange("fromPostalCode", e.target.value)}
                  />
                </div>
              </div>
              {/* Add sender email field to the From section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromSender">Sender</Label>
                  <Input
                    id="fromSender"
                    value={formData.fromSender}
                    onChange={(e) => handleChange("fromSender", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fromTel">Tel</Label>
                  <Input
                    id="fromTel"
                    value={formData.fromTel}
                    onChange={(e) => handleChange("fromTel", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fromEmail">Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => handleChange("fromEmail", e.target.value)}
                  placeholder="sender@example.com"
                  required={formData.enableElectronicDeliveryReceipt}
                />
              </div>
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-4">
            <div className="bg-black text-white p-2">To</div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="toStreetAddress">Street Address</Label>
                <Input
                  id="toStreetAddress"
                  value={formData.toStreetAddress}
                  onChange={(e) => handleChange("toStreetAddress", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toSuburb">Suburb</Label>
                  <Input
                    id="toSuburb"
                    value={formData.toSuburb}
                    onChange={(e) => handleChange("toSuburb", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="toCity">City</Label>
                  <Input id="toCity" value={formData.toCity} onChange={(e) => handleChange("toCity", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toCountry">Country</Label>
                  <Input
                    id="toCountry"
                    value={formData.toCountry}
                    onChange={(e) => handleChange("toCountry", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="toPostalCode">Postal Code</Label>
                  <Input
                    id="toPostalCode"
                    value={formData.toPostalCode}
                    onChange={(e) => handleChange("toPostalCode", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toReceiver">Receiver</Label>
                  <Input
                    id="toReceiver"
                    value={formData.toReceiver}
                    onChange={(e) => handleChange("toReceiver", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="toTel">Tel</Label>
                  <Input id="toTel" value={formData.toTel} onChange={(e) => handleChange("toTel", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="toEmail">Email</Label>
                <Input
                  id="toEmail"
                  type="email"
                  value={formData.toEmail}
                  onChange={(e) => handleChange("toEmail", e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Type Checkboxes */}
        <div className="flex flex-wrap gap-6 p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overnightExpress"
              checked={formData.overnightExpress}
              onCheckedChange={(checked) => handleChange("overnightExpress", checked)}
            />
            <Label htmlFor="overnightExpress">Overnight Express</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameDayExpress"
              checked={formData.sameDayExpress}
              onCheckedChange={(checked) => handleChange("sameDayExpress", checked)}
            />
            <Label htmlFor="sameDayExpress">Same Day Express</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="roadFreight"
              checked={formData.roadFreight}
              onCheckedChange={(checked) => handleChange("roadFreight", checked)}
            />
            <Label htmlFor="roadFreight">Road Freight</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="economy"
              checked={formData.economy}
              onCheckedChange={(checked) => handleChange("economy", checked)}
            />
            <Label htmlFor="economy">Economy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nextDay"
              checked={formData.nextDay}
              onCheckedChange={(checked) => handleChange("nextDay", checked)}
            />
            <Label htmlFor="nextDay">Next Day</Label>
          </div>
        </div>

        {/* Package Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left w-16">No</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Dimensions</th>
                <th className="border p-2 text-left">Vol. KGS</th>
                <th className="border p-2 text-left">Mass KGS</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.no}>
                  <td className="border p-2">{item.no}</td>
                  <td className="border p-2">
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <Input
                      value={item.dimensions}
                      onChange={(e) => handleItemChange(index, "dimensions", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <Input value={item.volKgs} onChange={(e) => handleItemChange(index, "volKgs", e.target.value)} />
                  </td>
                  <td className="border p-2">
                    <Input value={item.massKgs} onChange={(e) => handleItemChange(index, "massKgs", e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" variant="outline" onClick={addItem} className="mt-2 bg-transparent">
            Add Item
          </Button>
        </div>

        {/* Special Instructions */}
        <div>
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <Textarea
            id="specialInstructions"
            value={formData.specialInstructions}
            onChange={(e) => handleChange("specialInstructions", e.target.value)}
            className="h-24"
          />
        </div>

        {/* Electronic Delivery Receipt Section */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="font-semibold mb-4">Electronic Delivery Receipt</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableElectronicDeliveryReceipt"
                checked={formData.enableElectronicDeliveryReceipt}
                onCheckedChange={(checked) => handleChange("enableElectronicDeliveryReceipt", checked === true)}
              />
              <Label htmlFor="enableElectronicDeliveryReceipt">Enable Electronic Delivery Receipt</Label>
            </div>

            {formData.enableElectronicDeliveryReceipt && (
              <>
                <div className="pl-6 space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">Recipient Notifications</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyRecipient"
                      checked={formData.notifyRecipient}
                      onCheckedChange={(checked) => handleChange("notifyRecipient", checked === true)}
                    />
                    <Label htmlFor="notifyRecipient">Notify recipient via email</Label>
                  </div>

                  <h4 className="font-medium text-sm text-gray-700 mt-4">Sender Notifications</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifySenderOnCreate"
                      checked={formData.notifySenderOnCreate}
                      onCheckedChange={(checked) => handleChange("notifySenderOnCreate", checked === true)}
                    />
                    <Label htmlFor="notifySenderOnCreate">Notify sender when order is created</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifySenderOnConfirm"
                      checked={formData.notifySenderOnConfirm}
                      onCheckedChange={(checked) => handleChange("notifySenderOnConfirm", checked === true)}
                    />
                    <Label htmlFor="notifySenderOnConfirm">Notify sender when delivery is confirmed</Label>
                  </div>

                  <h4 className="font-medium text-sm text-gray-700 mt-4">Admin Notifications</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendConfirmationToAdmin"
                      checked={formData.sendConfirmationToAdmin}
                      onCheckedChange={(checked) => handleChange("sendConfirmationToAdmin", checked === true)}
                    />
                    <Label htmlFor="sendConfirmationToAdmin">Send confirmation to admin</Label>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePreviewEmail()}
                          disabled={!formData.notifyRecipient}
                        >
                          Preview Recipient Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Recipient Email Preview</DialogTitle>
                        </DialogHeader>
                        {emailPreview && <div dangerouslySetInnerHTML={{ __html: emailPreview }} />}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePreviewSenderEmail("created")}
                          disabled={!formData.notifySenderOnCreate}
                        >
                          Preview Sender Creation Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Sender Order Created Email Preview</DialogTitle>
                        </DialogHeader>
                        {emailPreview && <div dangerouslySetInnerHTML={{ __html: emailPreview }} />}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePreviewSenderEmail("confirmed")}
                          disabled={!formData.notifySenderOnConfirm}
                        >
                          Preview Sender Confirmation Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Sender Delivery Confirmed Email Preview</DialogTitle>
                        </DialogHeader>
                        {emailPreview && <div dangerouslySetInnerHTML={{ __html: emailPreview }} />}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sendersName">Sender's Name</Label>
              <Input
                id="sendersName"
                value={formData.sendersName}
                onChange={(e) => handleChange("sendersName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sendersDate">Date</Label>
              <Input
                type="date"
                id="sendersDate"
                value={formData.sendersDate}
                onChange={(e) => handleChange("sendersDate", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="receiversName">Receiver's Name</Label>
              <Input
                id="receiversName"
                value={formData.receiversName}
                onChange={(e) => handleChange("receiversName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="receiversDate">Date</Label>
              <Input
                type="date"
                id="receiversDate"
                value={formData.receiversDate}
                onChange={(e) => handleChange("receiversDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
