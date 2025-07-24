"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import type { Order, FreightType, OrderStatus } from "@/types/models"
import { useCreateOrderMutation } from "@/hooks/useOrdersQuery"
import { useCustomersQuery } from "@/hooks/useCustomersQuery"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CreateOrderProps {
  initialData?: Partial<Order>
  onSuccess?: (order: Order) => void
  onCancel?: () => void
}

export default function CreateOrder({ initialData = {}, onSuccess, onCancel }: CreateOrderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const createOrderMutation = useCreateOrderMutation()
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomersQuery({ pageSize: 999 })
  const customers = customersData?.data || []

  const [formData, setFormData] = useState<Partial<Order>>({
    customer_id: initialData.customer_id || "",
    customer_name: initialData.customer_name || "",
    po_number: initialData.po_number || "",
    order_date: initialData.order_date || format(new Date(), "yyyy-MM-dd"),
    status: initialData.status || "Pending",
    freight_type: initialData.freight_type || "Ocean",
    origin_address: initialData.origin_address || {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    destination_address: initialData.destination_address || {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    total_value: initialData.total_value || 0,
    currency: initialData.currency || "USD",
    expected_delivery_date: initialData.expected_delivery_date || "",
    notes: initialData.notes || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    if (id.startsWith("origin_address.")) {
      const field = id.split(".")[1] as keyof typeof formData.origin_address
      setFormData((prev) => ({
        ...prev,
        origin_address: { ...prev.origin_address!, [field]: value },
      }))
    } else if (id.startsWith("destination_address.")) {
      const field = id.split(".")[1] as keyof typeof formData.destination_address
      setFormData((prev) => ({
        ...prev,
        destination_address: { ...prev.destination_address!, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }))
    }
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  const handleSelectChange = (id: keyof Order, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  const handleDateChange = (id: keyof Order, date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [id]: date ? format(date, "yyyy-MM-dd") : "",
    }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.customer_id) newErrors.customer_id = "Customer is required"
    if (!formData.po_number?.trim()) newErrors.po_number = "PO Number is required"
    if (!formData.order_date) newErrors.order_date = "Order Date is required"
    if (!formData.origin_address?.street?.trim()) newErrors["origin_address.street"] = "Origin street is required"
    if (!formData.origin_address?.city?.trim()) newErrors["origin_address.city"] = "Origin city is required"
    if (!formData.origin_address?.country?.trim()) newErrors["origin_address.country"] = "Origin country is required"
    if (!formData.destination_address?.street?.trim())
      newErrors["destination_address.street"] = "Destination street is required"
    if (!formData.destination_address?.city?.trim())
      newErrors["destination_address.city"] = "Destination city is required"
    if (!formData.destination_address?.country?.trim())
      newErrors["destination_address.country"] = "Destination country is required"
    if (!formData.total_value || formData.total_value <= 0) newErrors.total_value = "Total Value must be greater than 0"
    if (!formData.currency?.trim()) newErrors.currency = "Currency is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    const selectedCustomer = customers.find((c) => c.id === formData.customer_id)
    const customerName = selectedCustomer ? selectedCustomer.name : formData.customer_name // Fallback if not found

    const orderToCreate: Partial<Order> = {
      ...formData,
      customer_name: customerName, // Ensure customer_name is set
      total_value: Number.parseFloat(formData.total_value as any), // Ensure it's a number
    }

    try {
      const result = await createOrderMutation.mutateAsync(orderToCreate)
      toast({
        title: "Success",
        description: `Order ${result.po_number} created successfully!`,
      })
      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push(`/orders/${result.id}`)
      }
    } catch (error) {
      console.error("Failed to create order:", error)
      toast({
        title: "Error",
        description: `Failed to create order: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  const freightTypes: FreightType[] = ["Air", "Ocean", "Road", "Rail", "Multimodal"]
  const orderStatuses: OrderStatus[] = [
    "Pending",
    "Processing",
    "In Transit",
    "Customs Clearance",
    "Delivered",
    "Completed",
    "Cancelled",
    "On Hold",
    "Exception",
  ]
  const currencies = ["USD", "EUR", "GBP", "ZAR"] // Example currencies

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Order</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-2">
          <Label htmlFor="customer_id" className={errors.customer_id ? "text-red-500" : ""}>
            Customer *
          </Label>
          {isLoadingCustomers ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading customers...</span>
            </div>
          ) : (
            <Select value={formData.customer_id} onValueChange={(value) => handleSelectChange("customer_id", value)}>
              <SelectTrigger id="customer_id" className={errors.customer_id ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.customer_id && <p className="text-xs text-red-500">{errors.customer_id}</p>}
        </div>

        {/* PO Number */}
        <div className="space-y-2">
          <Label htmlFor="po_number" className={errors.po_number ? "text-red-500" : ""}>
            PO Number *
          </Label>
          <Input
            id="po_number"
            value={formData.po_number}
            onChange={handleInputChange}
            className={errors.po_number ? "border-red-500" : ""}
          />
          {errors.po_number && <p className="text-xs text-red-500">{errors.po_number}</p>}
        </div>

        {/* Order Date */}
        <div className="space-y-2">
          <Label htmlFor="order_date" className={errors.order_date ? "text-red-500" : ""}>
            Order Date *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.order_date && "text-muted-foreground",
                  errors.order_date && "border-red-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.order_date ? format(new Date(formData.order_date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.order_date ? new Date(formData.order_date) : undefined}
                onSelect={(date) => handleDateChange("order_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.order_date && <p className="text-xs text-red-500">{errors.order_date}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value as OrderStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Freight Type */}
        <div className="space-y-2">
          <Label htmlFor="freight_type">Freight Type</Label>
          <Select
            value={formData.freight_type}
            onValueChange={(value) => handleSelectChange("freight_type", value as FreightType)}
          >
            <SelectTrigger id="freight_type">
              <SelectValue placeholder="Select freight type" />
            </SelectTrigger>
            <SelectContent>
              {freightTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total Value */}
        <div className="space-y-2">
          <Label htmlFor="total_value" className={errors.total_value ? "text-red-500" : ""}>
            Total Value *
          </Label>
          <Input
            id="total_value"
            type="number"
            value={formData.total_value}
            onChange={handleInputChange}
            className={errors.total_value ? "border-red-500" : ""}
          />
          {errors.total_value && <p className="text-xs text-red-500">{errors.total_value}</p>}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency" className={errors.currency ? "text-red-500" : ""}>
            Currency *
          </Label>
          <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
            <SelectTrigger id="currency" className={errors.currency ? "border-red-500" : ""}>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
        </div>

        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expected_delivery_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expected_delivery_date ? (
                  format(new Date(formData.expected_delivery_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expected_delivery_date ? new Date(formData.expected_delivery_date) : undefined}
                onSelect={(date) => handleDateChange("expected_delivery_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Origin Address */}
      <div className="space-y-4 border p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700">Origin Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin_address.street" className={errors["origin_address.street"] ? "text-red-500" : ""}>
              Street *
            </Label>
            <Input
              id="origin_address.street"
              value={formData.origin_address?.street || ""}
              onChange={handleInputChange}
              className={errors["origin_address.street"] ? "border-red-500" : ""}
            />
            {errors["origin_address.street"] && (
              <p className="text-xs text-red-500">{errors["origin_address.street"]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin_address.city" className={errors["origin_address.city"] ? "text-red-500" : ""}>
              City *
            </Label>
            <Input
              id="origin_address.city"
              value={formData.origin_address?.city || ""}
              onChange={handleInputChange}
              className={errors["origin_address.city"] ? "border-red-500" : ""}
            />
            {errors["origin_address.city"] && <p className="text-xs text-red-500">{errors["origin_address.city"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin_address.postalCode">Postal Code</Label>
            <Input
              id="origin_address.postalCode"
              value={formData.origin_address?.postalCode || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin_address.country" className={errors["origin_address.country"] ? "text-red-500" : ""}>
              Country *
            </Label>
            <Input
              id="origin_address.country"
              value={formData.origin_address?.country || ""}
              onChange={handleInputChange}
              className={errors["origin_address.country"] ? "border-red-500" : ""}
            />
            {errors["origin_address.country"] && (
              <p className="text-xs text-red-500">{errors["origin_address.country"]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Destination Address */}
      <div className="space-y-4 border p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700">Destination Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="destination_address.street"
              className={errors["destination_address.street"] ? "text-red-500" : ""}
            >
              Street *
            </Label>
            <Input
              id="destination_address.street"
              value={formData.destination_address?.street || ""}
              onChange={handleInputChange}
              className={errors["destination_address.street"] ? "border-red-500" : ""}
            />
            {errors["destination_address.street"] && (
              <p className="text-xs text-red-500">{errors["destination_address.street"]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="destination_address.city"
              className={errors["destination_address.city"] ? "text-red-500" : ""}
            >
              City *
            </Label>
            <Input
              id="destination_address.city"
              value={formData.destination_address?.city || ""}
              onChange={handleInputChange}
              className={errors["destination_address.city"] ? "border-red-500" : ""}
            />
            {errors["destination_address.city"] && (
              <p className="text-xs text-red-500">{errors["destination_address.city"]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination_address.postalCode">Postal Code</Label>
            <Input
              id="destination_address.postalCode"
              value={formData.destination_address?.postalCode || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="destination_address.country"
              className={errors["destination_address.country"] ? "text-red-500" : ""}
            >
              Country *
            </Label>
            <Input
              id="destination_address.country"
              value={formData.destination_address?.country || ""}
              onChange={handleInputChange}
              className={errors["destination_address.country"] ? "border-red-500" : ""}
            />
            {errors["destination_address.country"] && (
              <p className="text-xs text-red-500">{errors["destination_address.country"]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createOrderMutation.isPending}>
          {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Order
        </Button>
      </div>
    </form>
  )
}
