"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Customer } from "@/types/models" // Assuming you have a Customer type

export default function CustomerDetailsPage() {
  const params = useParams()
  const customerId = params.id as string
  const { toast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Customer>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchCustomer() {
      if (!customerId) return

      setLoading(true)
      const { data, error } = await supabase.from("customers").select("*").eq("id", customerId).single()

      if (error) {
        console.error("Error fetching customer:", error)
        toast({
          title: "Error",
          description: "Failed to load customer details.",
          variant: "destructive",
        })
        setCustomer(null)
      } else {
        setCustomer(data)
        setFormData(data) // Initialize form data with fetched customer data
      }
      setLoading(false)
    }

    fetchCustomer()
  }, [customerId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await supabase.from("customers").update(formData).eq("id", customerId)

    if (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: "Failed to save customer details.",
        variant: "destructive",
      })
    } else {
      setCustomer((prev) => ({ ...prev!, ...formData })) // Update local state with saved data
      setEditing(false)
      toast({
        title: "Success",
        description: "Customer details saved successfully.",
      })
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setFormData(customer || {}) // Reset form data to original customer data
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Customer not found.
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Customer Details: {customer.name}</CardTitle>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={formData.country || ""} onChange={handleInputChange} disabled={!editing} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
