"use client"

import React from "react"
import { Suspense } from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface CustomerFormData {
  name: string
  primaryContact: {
    name: string
    landline: string
    cellphone: string
    email: string
  }
  secondaryContact: {
    name: string
    landline: string
    cellphone: string
    email: string
  }
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  vatNumber: string
  importersCode: string
}

// 1. Memoize the form sections to prevent unnecessary re-renders
const CustomerInfoSection = React.memo(({ formData, handleChange }) => (
  <Card>
    <CardHeader>
      <CardTitle>Customer Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("main", "name", e.target.value)}
            required
          />
        </div>
      </div>
    </CardContent>
  </Card>
))

export default function NewCustomer() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  // 3. Add a loading state for the initial page load
  const [pageLoading, setPageLoading] = useState(true)

  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    primaryContact: {
      name: "",
      landline: "",
      cellphone: "",
      email: "",
    },
    secondaryContact: {
      name: "",
      landline: "",
      cellphone: "",
      email: "",
    },
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    vatNumber: "",
    importersCode: "",
  })

  // 2. Replace the handleChange function with a memoized version
  const handleChange = useMemo(() => {
    return (section: "main" | "primaryContact" | "secondaryContact" | "address", field: string, value: string) => {
      setFormData((prev) => {
        if (section === "main") {
          return { ...prev, [field]: value }
        }
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        }
      })
    }
  }, [])

  // 4. Add useEffect to simulate data loading and set pageLoading to false
  React.useEffect(() => {
    // Simulate any initial data loading
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 5. Add a simple loading indicator at the beginning of the return statement
  if (pageLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Customer created.",
        description: "Your customer has been created successfully.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating customer.",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Customer</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>

        <Suspense fallback={<div>Loading form...</div>}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("main", "name", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) => handleChange("main", "vatNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="importersCode">Importer's Code</Label>
                    <Input
                      id="importersCode"
                      value={formData.importersCode}
                      onChange={(e) => handleChange("main", "importersCode", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryName">Contact Name</Label>
                    <Input
                      id="primaryName"
                      value={formData.primaryContact.name}
                      onChange={(e) => handleChange("primaryContact", "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryEmail">Email</Label>
                    <Input
                      id="primaryEmail"
                      type="email"
                      value={formData.primaryContact.email}
                      onChange={(e) => handleChange("primaryContact", "email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryLandline">Landline</Label>
                    <Input
                      id="primaryLandline"
                      type="tel"
                      value={formData.primaryContact.landline}
                      onChange={(e) => handleChange("primaryContact", "landline", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryCellphone">Cellphone</Label>
                    <Input
                      id="primaryCellphone"
                      type="tel"
                      value={formData.primaryContact.cellphone}
                      onChange={(e) => handleChange("primaryContact", "cellphone", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryName">Contact Name</Label>
                    <Input
                      id="secondaryName"
                      value={formData.secondaryContact.name}
                      onChange={(e) => handleChange("secondaryContact", "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryEmail">Email</Label>
                    <Input
                      id="secondaryEmail"
                      type="email"
                      value={formData.secondaryContact.email}
                      onChange={(e) => handleChange("secondaryContact", "email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryLandline">Landline</Label>
                    <Input
                      id="secondaryLandline"
                      type="tel"
                      value={formData.secondaryContact.landline}
                      onChange={(e) => handleChange("secondaryContact", "landline", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryCellphone">Cellphone</Label>
                    <Input
                      id="secondaryCellphone"
                      type="tel"
                      value={formData.secondaryContact.cellphone}
                      onChange={(e) => handleChange("secondaryContact", "cellphone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Physical Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => handleChange("address", "street", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => handleChange("address", "city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.address.postalCode}
                        onChange={(e) => handleChange("address", "postalCode", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => handleChange("address", "country", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Customer"}
              </Button>
            </div>
          </form>
        </Suspense>
      </div>
    </div>
  )
}
