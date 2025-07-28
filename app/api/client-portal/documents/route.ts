import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Get the user profile
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", clientId)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Check if customer_id column exists and has a value
    let customerId = userProfile.customer_id
    let customerName = null

    // If customer_id doesn't exist or is null, try to find a customer by email domain or use mock data
    if (!customerId) {
      if (userProfile.email) {
        const emailDomain = userProfile.email.split("@")[1]

        // Try to find a customer with matching email domain
        const { data: customers } = await supabase
          .from("customers")
          .select("id, name")
          .ilike("email", `%${emailDomain}%`)
          .limit(1)

        if (customers && customers.length > 0) {
          customerId = customers[0].id
          customerName = customers[0].name

          // Optionally update the user profile with the found customer_id
          await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
        }
      }
    }

    // If we still don't have a customer, use mock data
    if (!customerId) {
      // Return mock data
      return NextResponse.json({
        success: true,
        data: {
          documents: [
            {
              id: "1",
              name: "Invoice-2023-001.pdf",
              type: "Invoice",
              order: { po_number: "PO-2023-001" },
              status: "Approved",
              size: "1.2 MB",
              created_at: "2023-06-15",
            },
            {
              id: "2",
              name: "BOL-2023-002.pdf",
              type: "Bill of Lading",
              order: { po_number: "PO-2023-002" },
              status: "Pending Review",
              size: "0.8 MB",
              created_at: "2023-06-20",
            },
            {
              id: "3",
              name: "Packing-List-2023-003.pdf",
              type: "Packing List",
              order: { po_number: "PO-2023-003" },
              status: "Approved",
              size: "0.5 MB",
              created_at: "2023-06-25",
            },
          ],
          statistics: {
            totalDocuments: 3,
            approvedDocuments: 2,
            pendingDocuments: 1,
            thisMonthDocuments: 3,
          },
        },
      })
    }

    // Get customer info if we don't have it yet
    if (!customerName) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()

      if (customerError) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      customerName = customer.name
    }

    // Get orders for this customer to get their documents
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, po_number")
      .eq("customer_name", customerName)

    if (ordersError) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    const orderIds = orders.map((order) => order.id)

    // If no orders found, return empty documents
    if (orderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          documents: [],
          statistics: {
            totalDocuments: 0,
            approvedDocuments: 0,
            pendingDocuments: 0,
            thisMonthDocuments: 0,
          },
        },
      })
    }

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
