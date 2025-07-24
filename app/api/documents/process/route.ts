import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import type { Document } from "@/types/models"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()
    const file = formData.get("file") as File
    const orderId = formData.get("orderId") as string
    const documentType = formData.get("documentType") as Document["document_type"]
    const uploadedBy = formData.get("uploadedBy") as string // User ID or Name
    const notes = formData.get("notes") as string | undefined

    if (!file || !orderId || !documentType || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields: file, orderId, documentType, uploadedBy" },
        { status: 400 },
      )
    }

    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${orderId}/${fileName}` // Store documents in a folder per order

    // 1. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents") // Ensure you have a bucket named 'documents'
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file to Supabase Storage:", uploadError)
      return NextResponse.json({ error: "Failed to upload document", details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(filePath)
    const fileUrl = publicUrlData.publicUrl

    // 2. Insert document metadata into the 'documents' table
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        order_id: orderId,
        file_name: file.name, // Original file name
        file_url: fileUrl,
        document_type: documentType,
        uploaded_by: uploadedBy,
        notes: notes,
        status: "Pending", // Default status
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting document metadata:", insertError)
      // Attempt to delete the uploaded file if metadata insertion fails
      await supabase.storage.from("documents").remove([filePath])
      return NextResponse.json(
        { error: "Failed to save document metadata", details: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { success: true, message: "Document uploaded and processed successfully", data: document },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in POST /api/documents/process:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
