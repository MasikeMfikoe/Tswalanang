import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET: Fetch documents for a specific client's orders
export async function GET(request: NextRequest) {
  try {
    const supabaseServer = createServerClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // 1. Get the customer_id associated with the client user
    const { data: userProfile, error: userError } = await supabaseServer
      .from("user_profiles")
      .select("customer_id, email, department")
      .eq("id", clientId)
      .single()

    if (userError || !userProfile) {
      console.error("Error fetching user profile for client documents:", userError)
      return NextResponse.json({ error: "Failed to fetch client user profile" }, { status: 500 })
    }

    let customerId = userProfile.customer_id
    let customerName: string | null = null

    // If customer_id is not directly linked, try to find by email domain or department
    if (!customerId) {
      const emailDomain = userProfile.email?.split("@")[1]
      if (emailDomain) {
        const { data: customersByEmail, error: emailCustomerError } = await supabaseServer
          .from("customers")
          .select("id, name")
          .ilike("email", `%@${emailDomain}`)
          .limit(1)

        if (!emailCustomerError && customersByEmail && customersByEmail.length > 0) {
          customerId = customersByEmail[0].id
          customerName = customersByEmail[0].name
          // Optionally update user_profile with customer_id for future
          await supabaseServer.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
        }
      }

      if (!customerId && userProfile.department) {
        const { data: customersByName, error: nameCustomerError } = await supabaseServer
          .from("customers")
          .select("id, name")
          .ilike("name", userProfile.department)
          .limit(1)

        if (!nameCustomerError && customersByName && customersByName.length > 0) {
          customerId = customersByName[0].id
          customerName = customersByName[0].name
          // Optionally update user_profile with customer_id for future
          await supabaseServer.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
        }
      }
    } else {
      // If customerId exists, fetch customer name
      const { data: customerData, error: customerDataError } = await supabaseServer
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()
      if (!customerDataError && customerData) {
        customerName = customerData.name
      }
    }

    if (!customerId || !customerName) {
      // Fallback for demo/no linked customer
      const mockDocuments = [
        {
          id: "mock-doc-1",
          order_id: "mock-order-1",
          file_name: "Mock_Bill_of_Lading.pdf",
          file_url: "/placeholder.svg?height=100&width=100&text=Mock+BOL",
          document_type: "Bill of Lading",
          uploaded_at: new Date().toISOString(),
          uploaded_by: "System",
          status: "Approved",
          notes: "This is a mock document for demo purposes.",
        },
        {
          id: "mock-doc-2",
          order_id: "mock-order-2",
          file_name: "Mock_Commercial_Invoice.pdf",
          file_url: "/placeholder.svg?height=100&width=100&text=Mock+Invoice",
          document_type: "Commercial Invoice",
          uploaded_at: new Date().toISOString(),
          uploaded_by: "System",
          status: "Pending",
          notes: "Awaiting client review.",
        },
      ]
      return NextResponse.json({
        success: true,
        data: {
          customerName: userProfile.department || "Demo Client Company",
          documents: mockDocuments,
        },
      })
    }

    // 2. Fetch orders for this customer
    const { data: orders, error: ordersError } = await supabaseServer
      .from("orders")
      .select("id, po_number")
      .eq("customer_id", customerId)

    if (ordersError) {
      console.error("Error fetching client orders for documents:", ordersError)
      return NextResponse.json({ error: "Failed to fetch client orders" }, { status: 500 })
    }

    const orderIds = orders.map((order) => order.id)

    if (orderIds.length === 0) {
      return NextResponse.json({ success: true, data: { customerName, documents: [] } })
    }

    // 3. Fetch documents associated with these orders
    const { data: documents, error: documentsError } = await supabaseServer
      .from("documents")
      .select("*")
      .in("order_id", orderIds)
      .order("uploaded_at", { ascending: false })

    if (documentsError) {
      console.error("Error fetching client documents:", documentsError)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    // Map documents to include PO Number for easier display
    const documentsWithPo = documents.map((doc) => ({
      ...doc,
      po_number: orders.find((order) => order.id === doc.order_id)?.po_number || "N/A",
    }))

    return NextResponse.json({
      success: true,
      data: {
        customerName,
        documents: documentsWithPo,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/client-portal/documents:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
