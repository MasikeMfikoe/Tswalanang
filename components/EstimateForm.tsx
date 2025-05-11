"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/lib/toast"
import { customers } from "@/lib/sample-data" // Add this import

// Define the form schema
const estimateFormSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  customerEmail: z.string().email({ message: "Invalid email address" }),
  freightType: z.string().min(1, { message: "Freight type is required" }),
  commercialValue: z.string().min(1, { message: "Commercial value is required" }),
  customsDuties: z.string().min(1, { message: "Customs duties is required" }),
  handlingFees: z.string().min(1, { message: "Handling fees is required" }),
  shippingCost: z.string().min(1, { message: "Shipping cost is required" }),
  documentationFee: z.string().min(1, { message: "Documentation fee is required" }),
  communicationFee: z.string().min(1, { message: "Communication fee is required" }),
  notes: z.string().optional(),
})

type EstimateFormValues = z.infer<typeof estimateFormSchema>

// Default values for the form
const defaultValues: Partial<EstimateFormValues> = {
  customerId: "",
  freightType: "Air Freight",
  commercialValue: "",
  customsDuties: "",
  handlingFees: "",
  shippingCost: "",
  documentationFee: "",
  communicationFee: "",
  notes: "",
}

interface EstimateFormProps {
  initialData?: Partial<EstimateFormValues>
  isEditing?: boolean
}

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value)
}

export function EstimateForm({ initialData, isEditing = false }: EstimateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with react-hook-form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: initialData || defaultValues,
  })

  // Add this after the form initialization
  // Update customer email when customer changes
  useEffect(() => {
    const customerId = form.watch("customerId")
    if (customerId) {
      const selectedCustomer = customers.find((c) => c.id === customerId)
      if (selectedCustomer) {
        form.setValue("customerEmail", selectedCustomer.email)
      }
    }
  }, [form.watch("customerId")])

  // Watch specific form values that affect calculations
  const commercialValue = form.watch("commercialValue")
  const customsDuties = form.watch("customsDuties")
  const handlingFees = form.watch("handlingFees")
  const shippingCost = form.watch("shippingCost")
  const documentationFee = form.watch("documentationFee")
  const communicationFee = form.watch("communicationFee")
  const freightType = form.watch("freightType")

  // Calculate derived values using useMemo to prevent unnecessary recalculations
  const calculatedValues = useMemo(() => {
    const commValue = Number.parseFloat(commercialValue || "0")
    const custDuties = Number.parseFloat(customsDuties || "0")
    const handFees = Number.parseFloat(handlingFees || "0")
    const shipCost = Number.parseFloat(shippingCost || "0")
    const docFee = Number.parseFloat(documentationFee || "0")
    const commFee = Number.parseFloat(communicationFee || "0")

    // Calculate VAT on commercial value (15%)
    const customsVAT = commValue * 0.15

    // Calculate total disbursements
    const totalDisbursements = custDuties + customsVAT + handFees + shipCost + docFee + commFee

    // Calculate facility fee (2.5% of total disbursements)
    const facilityFee = totalDisbursements * 0.025

    // Calculate agency fee (3.5% of total disbursements)
    const agencyFee = totalDisbursements * 0.035

    // Calculate subtotal
    const subtotal = totalDisbursements + facilityFee + agencyFee

    // Calculate VAT on subtotal (15%)
    const vat = subtotal * 0.15

    // Calculate total
    const total = subtotal + vat

    return {
      customsVAT,
      totalDisbursements,
      facilityFee,
      agencyFee,
      subtotal,
      vat,
      total,
    }
  }, [commercialValue, customsDuties, handlingFees, shippingCost, documentationFee, communicationFee])

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    try {
      setIsSubmitting(true)

      // Get the selected customer's name
      const selectedCustomer = customers.find((c) => c.id === data.customerId)
      const customerName = selectedCustomer ? selectedCustomer.name : "Unknown Customer"

      // Combine form data with calculated values
      const estimateData = {
        ...data,
        customerName,
        customsVAT: calculatedValues.customsVAT,
        totalDisbursements: calculatedValues.totalDisbursements,
        facilityFee: calculatedValues.facilityFee,
        agencyFee: calculatedValues.agencyFee,
        subtotal: calculatedValues.subtotal,
        vat: calculatedValues.vat,
        total: calculatedValues.total,
      }

      // In a real app, this would be an API call to save the estimate
      console.log("Form data:", estimateData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: isEditing ? "Estimate updated" : "Estimate created",
        description: isEditing
          ? "Your estimate has been updated successfully."
          : "Your estimate has been created successfully.",
      })

      // Navigate back to estimates list
      router.push("/estimates")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Enter customer details for this estimate</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/estimates")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                  {isEditing ? "Update Estimate" : "Create Estimate"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@acmecorp.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="freightType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freight Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select freight type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Air Freight">Air Freight</SelectItem>
                      <SelectItem value="Sea Freight">Sea Freight</SelectItem>
                      <SelectItem value="EXW">EXW</SelectItem>
                      <SelectItem value="FOB">FOB</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === "Air Freight" && "Air freight provides faster delivery with premium rates"}
                    {field.value === "Sea Freight" && "Sea freight is more economical for larger shipments"}
                    {field.value === "EXW" && "Ex Works - Buyer arranges collection from seller's premises"}
                    {field.value === "FOB" && "Free On Board - Seller delivers goods on board the vessel"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
            <CardDescription>Enter the financial details for this estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="commercialValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commercial Value (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customsDuties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customs Duties (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="9250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Customs VAT (15% of commercial value):</span>
                <span className="font-medium">{formatCurrency(calculatedValues.customsVAT)}</span>
              </div>

              <FormField
                control={form.control}
                name="handlingFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handling Fees (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4625" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Cost (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="18500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation Fee ({freightType === "Air Freight" ? "Air" : "Sea"}) (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communicationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Fee ({freightType === "Air Freight" ? "Air" : "Sea"}) (R)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Priority shipment for manufacturing equipment"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Review the calculated totals for this estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Total Disbursements:</span>
                <span className="font-medium">{formatCurrency(calculatedValues.totalDisbursements)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Facility Fee (2.5%):</span>
                <span className="font-medium">{formatCurrency(calculatedValues.facilityFee)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Agency Fee (3.5%):</span>
                <span className="font-medium">{formatCurrency(calculatedValues.agencyFee)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculatedValues.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">VAT (15%):</span>
                <span className="font-medium">{formatCurrency(calculatedValues.vat)}</span>
              </div>
              <div className="flex items-center justify-between py-2 font-bold">
                <span>Total:</span>
                <span className="text-xl">{formatCurrency(calculatedValues.total)}</span>
              </div>
            </div>
          </CardContent>
          {/* Footer content removed and moved to header */}
        </Card>
      </form>
    </Form>
  )
}
