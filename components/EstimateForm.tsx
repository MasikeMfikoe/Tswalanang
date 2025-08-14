"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/lib/toast"
import { createEstimate, updateEstimate } from "@/lib/api/estimatesApi"
import { useRouter } from "next/navigation"

interface EstimateFormProps {
  initialData?: any
  isEditing?: boolean
  estimateId?: string
}

export function EstimateForm({ initialData, isEditing = false, estimateId }: EstimateFormProps) {
  const [formData, setFormData] = useState({
    customerId: initialData?.customerId || "",
    customerName: initialData?.customerName || "",
    customerEmail: initialData?.customerEmail || "",
    freightType: initialData?.freightType || "Air Freight",
    commercialValue: initialData?.commercialValue || 0,
    customsDuties: initialData?.customsDuties || 0,
    handlingFees: initialData?.handlingFees || 0,
    shippingCost: initialData?.shippingCost || 0,
    documentationFee: initialData?.documentationFee || 0,
    communicationFee: initialData?.communicationFee || 0,
    notes: initialData?.notes || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(true)

  const router = useRouter()

  const { data: customersResponse, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers?pageSize=50")
      if (!response.ok) throw new Error("Failed to fetch customers")
      return response.json()
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  const customersData = customersResponse?.data || []

  const calculatedValues = useMemo(() => {
    const isSeaFreight = formData.freightType.toLowerCase().includes("sea")

    // Auto-set documentation and communication fees based on freight type
    const autoDocFee = isSeaFreight ? 350 : 250
    const autoCommFee = isSeaFreight ? 350 : 150

    // Use manual values if set, otherwise use auto values
    const docFee = formData.documentationFee || autoDocFee
    const commFee = formData.communicationFee || autoCommFee

    // Calculate customs VAT (15% of commercial value)
    const customsVAT = formData.commercialValue * 0.15

    // Calculate total disbursements
    const totalDisbursements =
      formData.shippingCost + formData.customsDuties + customsVAT + formData.handlingFees + docFee + commFee

    // Calculate facility fee (2.5% of disbursements)
    const facilityFee = totalDisbursements * 0.025

    // Calculate agency fee (3.5% of disbursements)
    const agencyFee = totalDisbursements * 0.035

    // Calculate subtotal
    const subtotal = totalDisbursements + facilityFee + agencyFee

    // Calculate VAT (15% on vatable items - excluding shipping, customs duties, and customs VAT)
    const vatableAmount = formData.handlingFees + docFee + commFee + facilityFee + agencyFee
    const vat = vatableAmount * 0.15

    // Calculate total amount
    const totalAmount = subtotal + vat

    return {
      customsVAT,
      documentationFee: docFee,
      communicationFee: commFee,
      totalDisbursements,
      facilityFee,
      agencyFee,
      subtotal,
      vat,
      totalAmount,
    }
  }, [formData])

  useEffect(() => {
    const isSeaFreight = formData.freightType.toLowerCase().includes("sea")
    setFormData((prev) => ({
      ...prev,
      documentationFee: isSeaFreight ? 350 : 250,
      communicationFee: isSeaFreight ? 350 : 150,
    }))
  }, [formData.freightType])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customersData.find((c: any) => c.id === customerId)
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
      }))
      setUseManualEntry(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        customer_id: formData.customerId || `MANUAL_${Date.now()}`,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        freight_type: formData.freightType,
        commercial_value: formData.commercialValue,
        customs_duties: formData.customsDuties,
        customs_vat: calculatedValues.customsVAT,
        handling_fees: formData.handlingFees,
        shipping_cost: formData.shippingCost,
        documentation_fee: calculatedValues.documentationFee,
        communication_fee: calculatedValues.communicationFee,
        total_disbursements: calculatedValues.totalDisbursements,
        facility_fee: calculatedValues.facilityFee,
        agency_fee: calculatedValues.agencyFee,
        subtotal: calculatedValues.subtotal,
        vat: calculatedValues.vat,
        total_amount: calculatedValues.totalAmount,
        notes: formData.notes,
        status: "Draft",
      }

      let result
      if (isEditing && estimateId) {
        result = await updateEstimate(estimateId, submitData)
      } else {
        result = await createEstimate(submitData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Estimate Updated" : "Estimate Created",
          description: result.message,
        })

        // Reset form if creating new estimate
        if (!isEditing) {
          setFormData({
            customerId: "",
            customerName: "",
            customerEmail: "",
            freightType: "Air Freight",
            commercialValue: 0,
            customsDuties: 0,
            handlingFees: 0,
            shippingCost: 0,
            documentationFee: 0,
            communicationFee: 0,
            notes: "",
          })
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save estimate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/estimates")
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Customer Information</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Select a customer from your database ({customersData.length} customers available)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="estimate-form"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? "Creating..." : "Create Estimate"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form id="estimate-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information Section */}
          <div className="space-y-4">
            {!useManualEntry && customersData.length > 0 && (
              <div className="space-y-2">
                <Label>Select Customer</Label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersData.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setUseManualEntry(true)}>
                  Enter Customer Manually
                </Button>
              </div>
            )}

            {(useManualEntry || customersData.length === 0) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      placeholder="Enter customer email"
                      required
                    />
                  </div>
                </div>
                {customersData.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setUseManualEntry(false)}>
                    Select from Existing Customers
                  </Button>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Freight Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Freight Information</h3>
            <div className="space-y-2">
              <Label htmlFor="freightType">Freight Type *</Label>
              <Select value={formData.freightType} onValueChange={(value) => handleInputChange("freightType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                  <SelectItem value="Air Freight">Air Freight</SelectItem>
                  <SelectItem value="Road Freight">Road Freight</SelectItem>
                  <SelectItem value="Rail Freight">Rail Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Financial Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commercialValue">Commercial Value (R) *</Label>
                <Input
                  id="commercialValue"
                  type="number"
                  step="0.01"
                  value={formData.commercialValue}
                  onChange={(e) => handleInputChange("commercialValue", Number(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customsDuties">Customs Duties (R)</Label>
                <Input
                  id="customsDuties"
                  type="number"
                  step="0.01"
                  value={formData.customsDuties}
                  onChange={(e) => handleInputChange("customsDuties", Number(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Customs VAT (15% of commercial value)</Label>
                <Input value={formatCurrency(calculatedValues.customsVAT)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handlingFees">Handling Fees (R)</Label>
                <Input
                  id="handlingFees"
                  type="number"
                  step="0.01"
                  value={formData.handlingFees}
                  onChange={(e) => handleInputChange("handlingFees", Number(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCost">Shipping Cost (R)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={(e) => handleInputChange("shippingCost", Number(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentationFee">Documentation Fee ({formData.freightType}) (R)</Label>
                <Input
                  id="documentationFee"
                  type="number"
                  step="0.01"
                  value={formData.documentationFee}
                  onChange={(e) => handleInputChange("documentationFee", Number(e.target.value) || 0)}
                  placeholder={formData.freightType.toLowerCase().includes("sea") ? "350.00" : "250.00"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communicationFee">Communication Fee ({formData.freightType}) (R)</Label>
                <Input
                  id="communicationFee"
                  type="number"
                  step="0.01"
                  value={formData.communicationFee}
                  onChange={(e) => handleInputChange("communicationFee", Number(e.target.value) || 0)}
                  placeholder={formData.freightType.toLowerCase().includes("sea") ? "350.00" : "150.00"}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculated Totals Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Calculated Totals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Disbursements</Label>
                <Input value={formatCurrency(calculatedValues.totalDisbursements)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Facility Fee (2.5%)</Label>
                <Input value={formatCurrency(calculatedValues.facilityFee)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Agency Fee (3.5%)</Label>
                <Input value={formatCurrency(calculatedValues.agencyFee)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <Input value={formatCurrency(calculatedValues.subtotal)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>VAT (15%)</Label>
                <Input value={formatCurrency(calculatedValues.vat)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Total Amount</Label>
                <Input
                  value={formatCurrency(calculatedValues.totalAmount)}
                  readOnly
                  className="bg-gray-50 font-bold text-lg"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add any additional notes or comments..."
              rows={3}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
