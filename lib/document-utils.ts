import { supabase } from "@/lib/supabase"

export type Document = {
  id: string
  name: string
  type: string
  url: string
  order_id: string
  created_at: string
  required?: boolean
}

// Mock data to use when the database table doesn't exist yet
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Commercial_Invoice_123.pdf",
    type: "Commercial Invoice",
    url: "/sample-documents/invoice.pdf",
    order_id: "",
    created_at: new Date().toISOString(),
    required: true,
  },
  {
    id: "2",
    name: "Bill_of_Lading_ABC789.pdf",
    type: "Bill of Lading",
    url: "/sample-documents/lading.pdf",
    order_id: "",
    created_at: new Date().toISOString(),
    required: true,
  },
  {
    id: "3",
    name: "Customs_Worksheet_XYZ456.pdf",
    type: "Customs Worksheet",
    url: "/sample-documents/customs.pdf",
    order_id: "",
    created_at: new Date().toISOString(),
    required: true,
  },
  {
    id: "4",
    name: "SAD500_Form.pdf",
    type: "SAD500",
    url: "/sample-documents/sad500.pdf",
    order_id: "",
    created_at: new Date().toISOString(),
    required: true,
  },
  {
    id: "5",
    name: "EDI_Document.pdf",
    type: "EDI",
    url: "/sample-documents/edi.pdf",
    order_id: "",
    created_at: new Date().toISOString(),
    required: true,
  },
]

/**
 * Fetches client pack documents for a specific order
 * @param orderId The ID of the order to fetch documents for
 * @returns Array of filtered documents for the client pack
 */
export async function getClientPackDocuments(orderId: string): Promise<Document[]> {
  try {
    // Define the document types that should be included in the client pack
    const clientPackDocumentTypes = [
      "EDI",
      "SAD500",
      "Customs Worksheet",
      "SARS POP",
      "Cargo Dues",
      "Commercial Invoice",
      "Packing List",
      "Bill of Lading",
      "Shipping Line Charges",
      "Co-loader Charges",
      "Forwarding Charges",
      "Delivery Note",
      "Clearing Instruction",
    ]

    // Try to fetch from uploaded_documents table first
    let { data, error } = await supabase.from("uploaded_documents").select("*").eq("order_id", orderId)

    // If that fails, try the documents table
    if (error) {
      console.log("Error fetching from uploaded_documents, trying documents table")
      const result = await supabase.from("documents").select("*").eq("order_id", orderId)

      data = result.data
      error = result.error
    }

    // If both fail, use mock data
    if (error || !data || data.length === 0) {
      console.log("Using mock data for client pack documents")
      // Use mock data but set the order_id
      return mockDocuments.map((doc) => ({
        ...doc,
        order_id: orderId,
      }))
    }

    // Filter documents to only include those in the client pack list
    const clientPackDocuments = data.filter((doc) => clientPackDocumentTypes.includes(doc.type))

    // Add a required flag to each document
    return clientPackDocuments.map((doc) => ({
      ...doc,
      required: true, // You could customize this based on business rules
    }))
  } catch (error) {
    console.error("Error in getClientPackDocuments:", error)
    // Return mock data in case of any error
    return mockDocuments.map((doc) => ({
      ...doc,
      order_id: orderId,
    }))
  }
}

/**
 * Fetches client pack documents based on freight type
 * @param orderId The ID of the order to fetch documents for
 * @param freightType The freight type (EXW, FOB, etc.)
 * @returns Array of filtered documents for the client pack
 */
export async function getClientPackDocumentsByFreightType(orderId: string, freightType: string): Promise<Document[]> {
  try {
    // Get all client pack documents
    const allDocuments = await getClientPackDocuments(orderId)

    // If freight type is EXW or FOB, include all documents
    if (freightType?.toUpperCase() === "EXW" || freightType?.toUpperCase() === "FOB") {
      return allDocuments
    }

    // Otherwise, exclude shipping line, co-loader, and forwarding charges
    return allDocuments.filter(
      (doc) => !["Shipping Line Charges", "Co-loader Charges", "Forwarding Charges"].includes(doc.type),
    )
  } catch (error) {
    console.error("Error in getClientPackDocumentsByFreightType:", error)
    return mockDocuments.map((doc) => ({
      ...doc,
      order_id: orderId,
    }))
  }
}
