"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { emailService } from "@/lib/email-service"
import { generateSecureToken } from "@/lib/qr-code-utils"

export default function NewCourierOrderPage() {
  const router = useRouter()
  // Update the formData state to include sender email and notification preferences
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
    fromEmail: "", // New field for sender email

    // To details
    toStreetAddress: "",
    toSuburb: "",
    toCity: "",
    toCountry: "",
    toPostalCode: "",
    toReceiver: "",
    toTel: "",
    toEmail: "", // Recipient email

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
    notifySenderOnCreate: false, // New field
    notifySenderOnConfirm: false, // New field
  })

  const [emailPreview, setEmailPreview] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Update the handleChange function to handle the new notification toggles
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // Auto-enable/disable notification options based on electronic delivery receipt
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
    // Navigate back to courier orders page after submission
    router.push("/courier-orders")
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
          <Button type="submit" className="bg-black text-white hover:bg-gray-800" onClick={handleSubmit}>
            Save Order
          </Button>
        </div>
      </div>

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
          <Button type="button" variant="outline" onClick={addItem} className="mt-2">
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
