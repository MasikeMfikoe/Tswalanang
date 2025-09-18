const mockStorage = {
  documents: new Map<string, any>(),

  upload: async (file: File, filePath: string, orderId: string, documentType: string, poNumber?: string) => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const url = URL.createObjectURL(file) // Create blob URL for preview

    const document = {
      id,
      name: file.name,
      type: documentType,
      url,
      size: file.size,
      created_at: new Date().toISOString(),
      order_id: orderId,
      po_number: poNumber || orderId, // Store PO number for documents page
      file_path: filePath,
    }

    mockStorage.documents.set(id, document)
    console.log("[v0] Document stored in shared storage:", document)
    return { data: document }
  },

  getDocuments: async (orderId: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const documents = Array.from(mockStorage.documents.values()).filter((doc) => doc.order_id === orderId)
    console.log("[v0] Retrieved documents from shared storage for order", orderId, ":", documents)
    return { data: documents }
  },

  getAllDocuments: async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const documents = Array.from(mockStorage.documents.values())
    console.log("[v0] Retrieved all documents from shared storage:", documents)
    return { data: documents }
  },

  delete: async (documentId: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const document = mockStorage.documents.get(documentId)
    if (document && document.url.startsWith("blob:")) {
      URL.revokeObjectURL(document.url) // Clean up blob URL
    }

    mockStorage.documents.delete(documentId)
    console.log("[v0] Document deleted from shared storage:", documentId)
    return { success: true }
  },
}

export default mockStorage
