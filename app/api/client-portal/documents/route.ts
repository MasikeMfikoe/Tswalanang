import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Get the customer_id for this client user
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("customer_id")
      .eq("id", clientId)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (!userProfile?.customer_id) {
      return NextResponse.json({ error: "Client not linked to customer" }, { status: 404 })
    }

    // Get customer info
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("name")
      .eq("id", userProfile.customer_id)
      .single()

    if (customerError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Get orders for this customer to get their documents
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, po_number")
      .eq("customer_name", customer.name)

    if (ordersError) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    const orderIds = orders.map((order) => order.id)

    // Get documents for these orders
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select(`
        *,
        order:orders!inner(po_number, id)
      `)
      .in("order_id", orderIds)
      .order("created_at", { ascending: false })

    if (documentsError) {
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    // Calculate statistics
    const approvedDocs = documents.filter((doc) => doc.status === "Approved")
    const pendingDocs = documents.filter((doc) => doc.status === "Pending Review")
    const thisMonthDocs = documents.filter((doc) => {
      const docDate = new Date(doc.created_at)
      const now = new Date()
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
    })

    return NextResponse.json({
      success: true,
      data: {
        documents,
        statistics: {
          totalDocuments: documents.length,
          approvedDocuments: approvedDocs.length,
          pendingDocuments: pendingDocs.length,
          thisMonthDocuments: thisMonthDocs.length,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching client documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
