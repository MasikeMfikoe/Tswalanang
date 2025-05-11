import { z } from "zod"

// Basic validation schemas
export const emailSchema = z.string().email("Invalid email address").min(1, "Email is required")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const phoneSchema = z.string().regex(/^\+?[0-9\s\-()]{10,15}$/, "Invalid phone number format")

// Order validation schema
export const orderSchema = z.object({
  poNumber: z.string().min(1, "PO Number is required"),
  supplier: z.string().min(1, "Supplier is required"),
  importer: z.string().min(1, "Importer is required"),
  status: z.enum(["Pending", "In Progress", "Completed", "Cancelled"]),
  cargoStatus: z.enum([
    "instruction-sent",
    "agent-response",
    "at-origin",
    "cargo-departed",
    "in-transit",
    "at-destination",
    "delivered",
  ]),
  freightType: z.enum(["Air Freight", "Sea Freight", "EXW", "FOB"]),
  cargoStatusComment: z.string().optional(),
})

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: emailSchema,
  phone: phoneSchema,
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
})

// Document validation schema
export const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  orderId: z.string().min(1, "Order ID is required"),
})

// Delivery validation schema
export const deliverySchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  status: z.string().min(1, "Status is required"),
  estimatedDelivery: z.string().min(1, "Estimated delivery date is required"),
  driverName: z.string().min(1, "Driver name is required"),
  deliveryCompany: z.string().min(1, "Delivery company is required"),
  poNumber: z.string().min(1, "PO Number is required"),
})

// Courier order validation schema
export const courierOrderSchema = z.object({
  waybillNo: z.string().min(1, "Waybill number is required"),
  poNumber: z.string().min(1, "PO Number is required"),
  sender: z.string().min(1, "Sender is required"),
  receiver: z.string().min(1, "Receiver is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  status: z.string().min(1, "Status is required"),
  serviceType: z.enum(["Express", "Standard", "Economy", "Next Day"]),
})

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

// Registration validation schema
export const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: passwordSchema,
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "manager", "employee", "guest"]),
  department: z.string().min(1, "Department is required"),
})

// Validation helper function
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}

      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })

      return {
        success: false,
        errors,
      }
    }

    return {
      success: false,
      errors: {
        _form: "An unexpected error occurred",
      },
    }
  }
}
