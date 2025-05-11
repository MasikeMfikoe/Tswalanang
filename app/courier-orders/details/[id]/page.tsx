"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { courierOrders } from "@/lib/sample-data"
import { generateQRCode, generateSecureToken } from "@/lib/qr-code-utils"
import { toast } from "@/components/ui/use-toast"

// Add these imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CourierOrderDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Add state for notification history and resend dialog
  const [notificationHistory, setNotificationHistory] = useState([
    // Sample notification history data
    {
      id: 1,
      type: "recipient",
      email: "sarah.j@example.com",
      status: "sent",
      sentAt: "2024-02-25 09:15",
    },
    {
      id: 2,
      type: "sender_created",
      email: "john.smith@example.com",
      status: "sent",
      sentAt: "2024-02-25 09:16",
    },
    {
      id: 3,
      type: "admin",
      email: "admin@example.com",
      status: "failed",
      sentAt: "2024-02-25 09:17",
    },
  ])

  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false)
  const [resendType, setResendType] = useState("")
  const [resendEmail, setResendEmail] = useState("")

  useEffect(() => {
    // Simulate API call to fetch order details
    setLoading(true)
    const foundOrder = courierOrders.find((order) => order.id === params.id)

    // Add more detailed data for the order details view
    if (foundOrder) {
      const enhancedOrder = {
        ...foundOrder,
        items: [
          { id: 1, description: "Electronic Components", dimensions: "30x20x15cm", volKgs: 2.5, massKgs: 3.2 },
          { id: 2, description: "Product Documentation", dimensions: "25x20x5cm", volKgs: 0.8, massKgs: 1.0 },
          { id: 3, description: "Spare Parts Kit", dimensions: "40x30x20cm", volKgs: 4.2, massKgs: 5.5 },
        ],
        trackingEvents: [
          {
            id: 1,
            status: "Order Created",
            location: foundOrder.fromLocation,
            timestamp: "2024-02-25 08:30",
            notes: "Order received and processed",
          },
          {
            id: 2,
            status: "Picked Up",
            location: foundOrder.fromLocation,
            timestamp: "2024-02-25 14:45",
            notes: "Package collected from sender",
          },
          {
            id: 3,
            status: "In Transit",
            location: `${foundOrder.fromLocation} Hub`,
            timestamp: "2024-02-26 09:15",
            notes: "Package in sorting facility",
          },
          {
            id: 4,
            status: "In Transit",
            location: `${foundOrder.toLocation} Hub`,
            timestamp: "2024-02-27 07:30",
            notes: "Package arrived at destination hub",
          },
          {
            id: 5,
            status: "Out for Delivery",
            location: foundOrder.toLocation,
            timestamp: "2024-02-27 10:45",
            notes: "Package out for final delivery",
          },
        ],
        specialInstructions:
          "Please handle with care. Fragile electronic components inside. Call recipient 30 minutes before delivery.",
        accountDetails: {
          accountNumber: "ACC-12345",
          accountType: "Corporate",
          creditLimit: "R 50,000",
          paymentTerms: "Net 30",
        },
        contactDetails: {
          sender: {
            name: "John Smith",
            company: foundOrder.sender,
            phone: "+27 82 123 4567",
            email: "john.smith@example.com",
            address: `123 Main Street, ${foundOrder.fromLocation}, South Africa`,
          },
          receiver: {
            name: "Sarah Johnson",
            company: foundOrder.receiver,
            phone: "+27 83 987 6543",
            email: "sarah.j@example.com",
            address: `456 Beach Road, ${foundOrder.toLocation}, South Africa`,
          },
        },
        serviceType: foundOrder.serviceType || "Express",
        insurance: "R 15,000",
        totalWeight: "9.7 kg",
        totalVolume: "7.5 kg",
        estimatedDelivery: "2024-02-28 17:00",
        actualDelivery: foundOrder.status === "Delivered" ? "2024-02-28 16:32" : null,
        cost: {
          baseCharge: "R 850.00",
          fuelSurcharge: "R 85.00",
          insurance: "R 150.00",
          tax: "R 162.75",
          total: "R 1,247.75",
        },
        // Add electronic delivery receipt fields
        enableElectronicDeliveryReceipt: true,
        notifyRecipient: true,
        sendConfirmationToAdmin: true,
        recipientEmail: "sarah.j@example.com",
        notificationSentAt: "2024-02-25 09:15",
      }
      setOrder(enhancedOrder)
      setRecipientEmail(enhancedOrder.contactDetails.receiver.email || "")

      // Generate QR code for delivery confirmation
      generateDeliveryQRCode(enhancedOrder.id)
    }

    setTimeout(() => {
      setLoading(false)
    }, 500) // Simulate loading delay
  }, [params.id, router])

  const generateDeliveryQRCode = async (orderId: string) => {
    try {
      const token = generateSecureToken(orderId)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://logistics.example.com"
      const confirmationUrl = `${baseUrl}/delivery-confirmation/${orderId}?token=${token}`

      const qrCode = await generateQRCode(confirmationUrl)
      setQrCodeUrl(qrCode)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const handleSendNotification = async () => {
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "Recipient email is required",
        variant: "destructive",
      })
      return
    }

    setIsSendingEmail(true)

    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: `Delivery email sent to ${recipientEmail}`,
      })

      setIsResendDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit":
        return "bg-blue-100 text-blue-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Processing":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Add function to handle resend notification
  const handleResendNotification = async () => {
    if (!resendEmail) {
      toast({
        title: "Error",
        description: "Email address is required",
        variant: "destructive",
      })
      return
    }

    setIsSendingEmail(true)

    try {
      // In a real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new notification to history
      setNotificationHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: resendType,
          email: resendEmail,
          status: "sent",
          sentAt: new Date().toLocaleString(),
        },
      ])

      toast({
        title: "Success",
        description: `Notification resent to ${resendEmail}`,
      })

      setIsResendDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Add function to open resend dialog
  const openResendDialog = (type: string, defaultEmail = "") => {
    setResendType(type)
    setResendEmail(defaultEmail)
    setIsResendDialogOpen(true)
  }

  const handleChange = (field: string, value: any) => {
    setOrder((prevOrder: any) => ({
      ...prevOrder,
      [field]: value,
    }))
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!order) {
    return <div className="p-6">Order not found</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courier Order Details: {order.waybillNo}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/courier-orders")}>
            Back to Orders
          </Button>
        </div>
      </div>

      {/* Order content would go here */}
      {/* Add notification history tab to the order details page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Waybill Number:</p>
                      <p>{order.waybillNo}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status:</p>
                      <p className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">From:</p>
                      <p>{order.fromLocation}</p>
                    </div>
                    <div>
                      <p className="font-semibold">To:</p>
                      <p>{order.toLocation}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Sender:</p>
                      <p>{order.sender}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Receiver:</p>
                      <p>{order.receiver}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Created Date:</p>
                      <p>{order.createdAt}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Service Type:</p>
                      <p>{order.serviceType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notificationHistory.length === 0 ? (
                      <p className="text-gray-500 italic">No notifications sent yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Type</th>
                              <th className="border p-2 text-left">Email</th>
                              <th className="border p-2 text-left">Status</th>
                              <th className="border p-2 text-left">Sent At</th>
                              <th className="border p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notificationHistory.map((notification) => (
                              <tr key={notification.id}>
                                <td className="border p-2">
                                  {notification.type === "recipient" && "Recipient Notification"}
                                  {notification.type === "sender_created" && "Sender Order Created"}
                                  {notification.type === "sender_confirmed" && "Sender Delivery Confirmed"}
                                  {notification.type === "admin" && "Admin Notification"}
                                </td>
                                <td className="border p-2">{notification.email}</td>
                                <td className="border p-2">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                                      notification.status === "sent"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {notification.status === "sent" ? "Sent" : "Failed"}
                                  </span>
                                </td>
                                <td className="border p-2">{notification.sentAt}</td>
                                <td className="border p-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openResendDialog(notification.type, notification.email)}
                                  >
                                    Resend
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => openResendDialog("recipient", order.contactDetails?.receiver?.email || "")}
                      >
                        Send New Notification
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.enableElectronicDeliveryReceipt ? (
                <>
                  <div className="text-center">
                    <p className="mb-2">QR Code for Delivery Confirmation</p>
                    {qrCodeUrl ? (
                      <div className="flex justify-center">
                        <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="border p-2 max-w-[200px]" />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
                          <p className="text-gray-500">Loading QR Code...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      Scan this QR code or share it with the recipient to confirm delivery
                    </p>

                    <Button onClick={() => setIsResendDialogOpen(true)}>Send Notification</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Electronic delivery receipt is not enabled for this order</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleChange("enableElectronicDeliveryReceipt", true)}
                  >
                    Enable Electronic Delivery
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resend Notification Dialog */}
      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notificationType">Notification Type</Label>
              <select
                id="notificationType"
                className="w-full p-2 border rounded-md"
                value={resendType}
                onChange={(e) => setResendType(e.target.value)}
              >
                <option value="recipient">Recipient Notification</option>
                <option value="sender_created">Sender Order Created</option>
                <option value="sender_confirmed">Sender Delivery Confirmed</option>
                <option value="admin">Admin Notification</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsResendDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResendNotification} disabled={isSendingEmail}>
                {isSendingEmail ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
