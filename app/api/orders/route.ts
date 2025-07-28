import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Supabase Configuration
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data (Replace with DB calls in real use)
const customers = [
  { id: "1", name: "Acme Corp", primaryContact: "John Doe", secondaryContact: "Jane Smith", totalOrders: 15 },
  {
    id: "2",
    name: "Global Traders",
    primaryContact: "Alice Johnson",
    secondaryContact: "Bob Williams",
    totalOrders: 8,
  },
  {
    id: "3",
    name: "Tech Innovators",
    primaryContact: "Charlie Brown",
    secondaryContact: "Diana Davis",
    totalOrders: 12,
  },
]

const orders = [
  { id: "1", poNumber: "PO001", supplier: "Supplier A", importer: "Acme Corp", status: "In Progress" },
  { id: "2", poNumber: "PO002", supplier: "Supplier B", importer: "Global Traders", status: "Completed" },
  { id: "3", poNumber: "PO003", supplier: "Supplier C", importer: "Tech Innovators", status: "Pending" },
]

// Add a new function to log audit entries
const logAuditEntry = (action: string, user: string, details: string) => {
  // In a real application, you would save this to a database
  console.log(`Audit: ${action} | User: ${user} | ${details} | ${new Date().toISOString()}`)
}

// 📌 Handle GET Requests
export async function GET(request: Request) {
  const url = new URL(request.url)
  const customerId = url.searchParams.get("customerId")

  if (customerId) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      const customerOrders = orders.filter((order) => order.importer === customer.name)
      return NextResponse.json({ customer, orders: customerOrders })
    }
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json(orders)
}

// 📌 Handle Order Creation (POST)
export async function POST(request: Request) {
  const body = await request.json()
  const newOrder = { id: String(orders.length + 1), ...body, createdAt: new Date().toISOString() }
  orders.push(newOrder)

  // Log the audit entry
  logAuditEntry("Order Created", body.createdBy || "Unknown", `Order ${newOrder.id} created`)

  return NextResponse.json(newOrder, { status: 201 })
}

// 📌 Handle Order Updates (PUT)
export async function PUT(request: Request) {
  const body = await request.json()
  const index = orders.findIndex((order) => order.id === body.id)
  if (index !== -1) {
    orders[index] = { ...orders[index], ...body, updatedAt: new Date().toISOString() }

    // Log the audit entry
    logAuditEntry("Order Updated", body.updatedBy || "Unknown", `Order ${body.id} updated`)

    return NextResponse.json(orders[index])
  }
  return NextResponse.json({ error: "Order not found" }, { status: 404 })
}

// 📌 Handle File Upload (POST)
export async function POST_upload(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string
    const uploadedBy = formData.get("uploadedBy") as string

    if (!file || !documentType) {
      return NextResponse.json({ error: "File and document type are required." }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileKey = `uploads/${documentType}/${uuidv4()}-${file.name}`

    const { data, error } = await supabase.storage.from("documents").upload(fileKey, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (error) {
      throw new Error(`Supabase storage error: ${error.message}`)
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${fileKey}`

    // Log the audit entry
    logAuditEntry("Document Uploaded", uploadedBy || "Unknown", `${documentType} uploaded: ${file.name}`)

    return NextResponse.json({ message: "File uploaded successfully", fileUrl }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "File upload failed", details: error }, { status: 500 })
  }
}
