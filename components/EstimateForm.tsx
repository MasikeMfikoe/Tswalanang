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
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

// Default values for the form - ensure all fields have defined values
const defaultValues: EstimateFormValues = {
  customerId: "",
  customerEmail: "",
  freightType: "Air Freight",
  commercialValue: "0",
  customsDuties: "0",
  handlingFees: "0",
  shippingCost: "0",
  documentationFee: "0",
  communicationFee: "0",
  notes: "",
}

interface EstimateFormProps {
  initialData?: Partial<EstimateFormValues>
  isEditing?: boolean
  estimateId?: string
}

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value)
}

export function EstimateForm({ initialData, isEditing = false, estimateId }: EstimateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch customers from API
  const {
    data: customersResponse,
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("Fetching customers...")
      const response = await fetch("/api/customers")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Customers API response:", data)
      return data
    },
    retry: 3,
    retryDelay: 1000,
  })

  // Extract customers array from API response
  const customersData = customersResponse?.data || []

  // Ensure initialData has all required fields with defined values
  const mergedInitialValues = {
    ...defaultValues,
    ...initialData,
  }

  // Initialize form with react-hook-form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: mergedInitialValues,
  })

  // Update customer email when customer changes
  useEffect(() => {
    const customerId = form.watch("customerId")
    if (customerId && customersData.length > 0) {
      const selectedCustomer = customersData.find((c: any) => c.id === customerId)
      if (selectedCustomer) {
        form.setValue("customerEmail", selectedCustomer.email || "")
      }
    }
  }, [form.watch("customerId"), customersData, form])

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
      setFormError(null)

      // Get the selected customer's name
      const selectedCustomer = customersData.find((c: any) => c.id === data.customerId)
      const customerName = selectedCustomer ? selectedCustomer.name : "Unknown Customer"

      // Combine form data with calculated values
      const estimateData = {
        customer_id: data.customerId,
        customer_name: customerName,
        customer_email: data.customerEmail,
        freight_type: data.freightType,
        commercial_value: Number.parseFloat(data.commercialValue || "0"),
        customs_duties: Number.parseFloat(data.customsDuties || "0"),
        customs_vat: calculatedValues.customsVAT,
        handling_fees: Number.parseFloat(data.handlingFees || "0"),
        shipping_cost: Number.parseFloat(data.shippingCost || "0"),
        documentation_fee: Number.parseFloat(data.documentationFee || "0"),
        communication_fee: Number.parseFloat(data.communicationFee || "0"),
        total_disbursements: calculatedValues.totalDisbursements,
        facility_fee: calculatedValues.facilityFee,
        agency_fee: calculatedValues.agencyFee,
        subtotal: calculatedValues.subtotal,
        vat: calculatedValues.vat,
        total_amount: calculatedValues.total,
        notes: data.notes || "",
        status: "Draft",
      }

      console.log("Submitting estimate data:", estimateData)

      // Direct API call instead of using the estimatesApi helper
      const url = isEditing && estimateId ? `/api/estimates/${estimateId}` : "/api/estimates"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      })

      const result = await response.json()
      console.log("API response:", result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      // Show success message
      toast({
        title: isEditing ? "Estimate updated" : "Estimate created",
        description: isEditing
          ? "Your estimate has been updated successfully."
          : "Your estimate has been created successfully.",
      })

      setFormSuccess(true)

      // Navigate immediately instead of using setTimeout
      router.push("/estimates")
      router.refresh()
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setFormError(error.message || "There was a problem saving your estimate. Please try again.")
      toast({
        title: "Error",
        description: error.message || "There was a problem saving your estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (isLoadingCustomers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading customers...</span>
      </div>
    )
  }

  // Show error state
  if (customersError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error loading customers: {customersError.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // If form was successfully submitted, show success message
  if (formSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your estimate has been {isEditing ? "updated" : "created"} successfully. Redirecting to estimates list...
          </AlertDescription>
        </Alert>
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Select a customer from your database ({customersData.length} customers available)
                </CardDescription>
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={customersData.length > 0 ? "Select a customer" : "No customers available"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData.length > 0 ? (
                          customersData.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-customers" disabled>
                            No customers found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {customersData.length === 0 && (
                        <span className="text-red-600">No customers found. Please add customers first.</span>
                      )}
                    </FormDescription>
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
                      <Input placeholder="contact@acmecorp.com" {...field} value={field.value || ""} />
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
                  <Select onValueChange={field.onChange} value={field.value || "Air Freight"}>
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
                      <Input type="number" placeholder="100000" {...field} value={field.value || "0"} />
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
                      <Input type="number" placeholder="9250" {...field} value={field.value || "0"} />
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
                      <Input type="number" placeholder="4625" {...field} value={field.value || "0"} />
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
                      <Input type="number" placeholder="18500" {...field} value={field.value || "0"} />
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
                      <Input type="number" placeholder="250" {...field} value={field.value || "0"} />
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
                      <Input type="number" placeholder="150" {...field} value={field.value || "0"} />
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
                        value={field.value || ""}
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
        </Card>
      </form>
    </Form>
  )
}
