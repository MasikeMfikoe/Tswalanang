"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Eye, Download, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface ProofOfDelivery {
  id: string
  shipmentId: string
  recipientName: string
  deliveryDate: string
  status: "Confirmed" | "Pending" | "Disputed"
  imageUrl: string
  notes?: string
}

export function PODManagement() {
  const [pods, setPods] = useState<ProofOfDelivery[]>([
    {
      id: "pod1",
      shipmentId: "SHP001",
      recipientName: "John Doe",
      deliveryDate: "2024-07-19",
      status: "Confirmed",
      imageUrl: "/placeholder.svg?height=200&width=300",
      notes: "Delivered to front desk.",
    },
    {
      id: "pod2",
      shipmentId: "SHP002",
      recipientName: "Jane Smith",
      deliveryDate: "2024-07-18",
      status: "Pending",
      imageUrl: "/placeholder.svg?height=200&width=300",
      notes: "Waiting for recipient signature.",
    },
    {
      id: "pod3",
      shipmentId: "SHP003",
      recipientName: "Bob Johnson",
      deliveryDate: "2024-07-17",
      status: "Disputed",
      imageUrl: "/placeholder.svg?height=200&width=300",
      notes: "Recipient claims missing items.",
    },
  ])
  const [newPodShipmentId, setNewPodShipmentId] = useState("")
  const [newPodRecipientName, setNewPodRecipientName] = useState("")
  const [newPodFile, setNewPodFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewPodFile(event.target.files[0])
    } else {
      setNewPodFile(null)
    }
  }

  const handleUploadPod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPodShipmentId.trim() || !newPodRecipientName.trim() || !newPodFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    toast({
      title: "Uploading POD",
      description: `Uploading POD for shipment ${newPodShipmentId}...`,
      duration: 3000,
    })

    try {
      // Simulate file upload and POD creation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newPod: ProofOfDelivery = {
        id: `pod_${Date.now()}`,
        shipmentId: newPodShipmentId,
        recipientName: newPodRecipientName,
        deliveryDate: new Date().toISOString().split("T")[0],
        status: "Confirmed", // Assuming new uploads are confirmed
        imageUrl: URL.createObjectURL(newPodFile), // Use blob URL for preview
        notes: "",
      }

      setPods((prevPods) => [...prevPods, newPod])
      setNewPodShipmentId("")
      setNewPodRecipientName("")
      setNewPodFile(null)
      toast({
        title: "POD Uploaded",
        description: `Proof of Delivery for shipment ${newPodShipmentId} uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading POD:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the POD. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePod = (idToDelete: string) => {
    if (confirm("Are you sure you want to delete this Proof of Delivery?")) {
      setPods((prevPods) => prevPods.filter((pod) => pod.id !== idToDelete))
      toast({
        title: "POD Deleted",
        description: "The Proof of Delivery has been removed.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePodStatus = (idToUpdate: string, newStatus: ProofOfDelivery["status"]) => {
    setPods((prevPods) => prevPods.map((pod) => (pod.id === idToUpdate ? { ...pod, status: newStatus } : pod)))
    toast({
      title: "POD Status Updated",
      description: `Status for POD ${idToUpdate} changed to ${newStatus}.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof of Delivery (POD) Management</CardTitle>
        <CardDescription>Manage and upload proof of delivery documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUploadPod} className="grid gap-4 md:grid-cols-2 border p-4 rounded-md bg-gray-50">
          <h3 className="col-span-full text-lg font-semibold">Upload New POD</h3>
          <div className="space-y-2">
            <Label htmlFor="shipment-id">Shipment ID</Label>
            <Input
              id="shipment-id"
              placeholder="e.g., SHP001"
              value={newPodShipmentId}
              onChange={(e) => setNewPodShipmentId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient Name</Label>
            <Input
              id="recipient-name"
              placeholder="e.g., John Doe"
              value={newPodRecipientName}
              onChange={(e) => setNewPodRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <Label htmlFor="pod-file">POD Document (Image/PDF)</Label>
            <Input id="pod-file" type="file" onChange={handleFileChange} />
          </div>
          <Button type="submit" className="col-span-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload POD
              </>
            )}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment ID</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                  No PODs found.
                </TableCell>
              </TableRow>
            ) : (
              pods.map((pod) => (
                <TableRow key={pod.id}>
                  <TableCell className="font-medium">{pod.shipmentId}</TableCell>
                  <TableCell>{pod.recipientName}</TableCell>
                  <TableCell>{pod.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        pod.status === "Confirmed" ? "success" : pod.status === "Pending" ? "secondary" : "destructive"
                      }
                    >
                      {pod.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={pod.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View POD for ${pod.shipmentId}`}
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={pod.imageUrl}
                          download={`POD_${pod.shipmentId}.png`}
                          aria-label={`Download POD for ${pod.shipmentId}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      {pod.status !== "Confirmed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdatePodStatus(pod.id, "Confirmed")}
                          aria-label={`Mark POD for ${pod.shipmentId} as Confirmed`}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {pod.status !== "Disputed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdatePodStatus(pod.id, "Disputed")}
                          aria-label={`Mark POD for ${pod.shipmentId} as Disputed`}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePod(pod.id)}
                        aria-label={`Delete POD for ${pod.shipmentId}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
