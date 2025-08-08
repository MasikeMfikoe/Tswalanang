"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface Estimate {
  id: string
  display_id: string
  customer_id: string
  origin: string
  destination: string
  cargo_details: string
  status: string
  created_at: string
  updated_at: string
}

export default function DebugEstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [newEstimate, setNewEstimate] = useState({
    customer_id: "",
    origin: "",
    destination: "",
    cargo_details: "",
  })
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEstimates()
  }, [])

  const fetchEstimates = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("estimates").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching estimates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch estimates.",
        variant: "destructive",
      })
    } else {
      setEstimates(data as Estimate[])
    }
    setLoading(false)
  }

  const handleCreateEstimate = async () => {
    setIsSubmitting(true)
    const { data, error } = await supabase.from("estimates").insert(newEstimate).select().single()
    if (error) {
      console.error("Error creating estimate:", error)
      toast({
        title: "Error",
        description: "Failed to create estimate.",
        variant: "destructive",
      })
    } else {
      setEstimates([data as Estimate, ...estimates])
      setNewEstimate({ customer_id: "", origin: "", destination: "", cargo_details: "" })
      toast({
        title: "Success",
        description: "Estimate created successfully.",
      })
    }
    setIsSubmitting(false)
  }

  const handleUpdateEstimate = async () => {
    if (!selectedEstimate) return

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from("estimates")
      .update(selectedEstimate)
      .eq("id", selectedEstimate.id)
      .select()
      .single()
    if (error) {
      console.error("Error updating estimate:", error)
      toast({
        title: "Error",
        description: "Failed to update estimate.",
        variant: "destructive",
      })
    } else {
      setEstimates(estimates.map((e) => (e.id === data.id ? (data as Estimate) : e)))
      setSelectedEstimate(null)
      toast({
        title: "Success",
        description: "Estimate updated successfully.",
      })
    }
    setIsSubmitting(false)
  }

  const handleDeleteEstimate = async (id: string) => {
    setIsSubmitting(true)
    const { error } = await supabase.from("estimates").delete().eq("id", id)
    if (error) {
      console.error("Error deleting estimate:", error)
      toast({
        title: "Error",
        description: "Failed to delete estimate.",
        variant: "destructive",
      })
    } else {
      setEstimates(estimates.filter((e) => e.id !== id))
      setSelectedEstimate(null)
      toast({
        title: "Success",
        description: "Estimate deleted successfully.",
      })
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Estimates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Estimate */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-customer-id">Customer ID</Label>
              <Input
                id="new-customer-id"
                value={newEstimate.customer_id}
                onChange={(e) => setNewEstimate({ ...newEstimate, customer_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-origin">Origin</Label>
              <Input
                id="new-origin"
                value={newEstimate.origin}
                onChange={(e) => setNewEstimate({ ...newEstimate, origin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-destination">Destination</Label>
              <Input
                id="new-destination"
                value={newEstimate.destination}
                onChange={(e) => setNewEstimate({ ...newEstimate, destination: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-cargo-details">Cargo Details</Label>
              <Textarea
                id="new-cargo-details"
                value={newEstimate.cargo_details}
                onChange={(e) => setNewEstimate({ ...newEstimate, cargo_details: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateEstimate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Estimate"}
            </Button>
          </CardContent>
        </Card>

        {/* Edit Selected Estimate */}
        {selectedEstimate && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Estimate: {selectedEstimate.display_id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-customer-id">Customer ID</Label>
                <Input
                  id="edit-customer-id"
                  value={selectedEstimate.customer_id}
                  onChange={(e) => setSelectedEstimate({ ...selectedEstimate, customer_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-origin">Origin</Label>
                <Input
                  id="edit-origin"
                  value={selectedEstimate.origin}
                  onChange={(e) => setSelectedEstimate({ ...selectedEstimate, origin: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-destination">Destination</Label>
                <Input
                  id="edit-destination"
                  value={selectedEstimate.destination}
                  onChange={(e) => setSelectedEstimate({ ...selectedEstimate, destination: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-cargo-details">Cargo Details</Label>
                <Textarea
                  id="edit-cargo-details"
                  value={selectedEstimate.cargo_details}
                  onChange={(e) => setSelectedEstimate({ ...selectedEstimate, cargo_details: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Input
                  id="edit-status"
                  value={selectedEstimate.status}
                  onChange={(e) => setSelectedEstimate({ ...selectedEstimate, status: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateEstimate} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Estimate"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedEstimate(null)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* List Estimates */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <p className="text-muted-foreground">No estimates found.</p>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">ID: {estimate.display_id || estimate.id}</p>
                    <p className="text-sm text-muted-foreground">Customer: {estimate.customer_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {estimate.origin} to {estimate.destination}
                    </p>
                    <p className="text-sm text-muted-foreground">Status: {estimate.status}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedEstimate(estimate)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteEstimate(estimate.id)} disabled={isSubmitting}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
