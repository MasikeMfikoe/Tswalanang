import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Simplified version
    return NextResponse.json({ text: "Document processed", extractedData: {} })
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "Error processing document" }, { status: 500 })
  }
}
