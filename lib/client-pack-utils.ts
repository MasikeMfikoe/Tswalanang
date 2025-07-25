import { supabase } from "@/lib/supabase"

// Define document types that should be included in Client Pack
const CLIENT_PACK_DOCUMENT_TYPES = [
  "EDI",
  "SAD500",
  "Customs Worksheet",
  "SASR POP",
  "Cargo Dues",
  "Commercial Invoice",
  "Packing List",
  "Bill of Lading",
]

// Additional document types for EXW & FOB only
const EXW_FOB_ADDITIONAL_DOCUMENT_TYPES = ["Shipping Line/Co-loader Charges", "Forwarding Charges", "Delivery Note"]

export interface ClientPackDocument {
  id: string
  name: string
  type: string
  url: string
  order_id: string
  created_at: string
  required?: boolean
}

/**
 * Retrieves documents for the client pack based on order ID and freight type
 *
 * @param orderId - The ID of the order
 * @param freightType - The freight type of the order (used to determine additional documents)
 * @returns Array of filtered documents for the client pack
 */
export async function getClientPackDocuments(orderId: string, freightType?: string): Promise<ClientPackDocument[]> {
  try {
    // Determine which document types to include based on freight type
    const documentTypes = [...CLIENT_PACK_DOCUMENT_TYPES]

    // Add additional document types for EXW & FOB
    if (freightType && ["EXW", "FOB"].includes(freightType.toUpperCase())) {
      documentTypes.push(...EXW_FOB_ADDITIONAL_DOCUMENT_TYPES)
    }

    // Fetch documents from Supabase
    const { data, error } = await supabase.from("uploaded_documents").select("*").eq("order_id", orderId)

    if (error) {
      console.error("Error fetching documents:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("No documents found for order:", orderId)
      return []
    }

    // Filter documents to only include those in the client pack list
    const clientPackDocuments = data.filter((doc) => documentTypes.includes(doc.type))

    // Add a required flag to each document
    return clientPackDocuments.map((doc) => ({
      ...doc,
      required: CLIENT_PACK_DOCUMENT_TYPES.includes(doc.type), // Required if in the main list
    }))
  } catch (error) {
    console.error("Error in getClientPackDocuments:", error)
    return []
  }
}

/**
 * Fallback function to generate mock documents when database is not available
 * This is for demonstration purposes only
 */
export function getMockClientPackDocuments(orderId: string, freightType?: string): ClientPackDocument[] {
  const documentTypes = [...CLIENT_PACK_DOCUMENT_TYPES]

  if (freightType && ["EXW", "FOB"].includes(freightType.toUpperCase())) {
    documentTypes.push(...EXW_FOB_ADDITIONAL_DOCUMENT_TYPES)
  }

  return documentTypes.map((type, index) => ({
    id: `mock-${index}`,
    name: `${type} Document.pdf`,
    type,
    url: "#",
    order_id: orderId,
    created_at: new Date().toISOString(),
    required: CLIENT_PACK_DOCUMENT_TYPES.includes(type),
  }))
}

/**
 * Generates a client pack for a given order ID
 *
 * @param orderId - The ID of the order
 * @returns An object containing the URL of the generated client pack
 */
export function generateClientPack(orderId: string) {
  console.log(`Generating client pack for order ${orderId}`)
  return { url: `/client-packs/${orderId}.pdf` }
}
