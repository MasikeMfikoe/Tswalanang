import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { documentId, imageUrl } = await request.json()

  if (!documentId || !imageUrl) {
    return NextResponse.json({ error: "documentId and imageUrl are required" }, { status: 400 })
  }

  console.log(`Processing document ${documentId} from URL: ${imageUrl}`)

  // Simulate OCR processing
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate delay

  const mockProcessedData = {
    documentId,
    extractedText: `This is mock extracted text for document ${documentId}. It contains details about a shipment, including:
      - Consignee: John Doe
      - Shipper: Acme Corp
      - Goods: Electronics
      - Quantity: 10 cartons
      - Weight: 500 kg
      - Dimensions: 2x2x2 meters
      - Tracking Number: ABC123XYZ
      - Date: 2024-07-20
      - Status: In Transit
    `,
    extractedFields: {
      consignee: "John Doe",
      shipper: "Acme Corp",
      goods: "Electronics",
      quantity: "10 cartons",
      weight: "500 kg",
      dimensions: "2x2x2 meters",
      trackingNumber: "ABC123XYZ",
      date: "2024-07-20",
      status: "In Transit",
    },
    processingStatus: "completed",
    processedAt: new Date().toISOString(),
  }

  // In a real application, you would save this processed data back to your database
  return NextResponse.json(mockProcessedData, { status: 200 })
}
