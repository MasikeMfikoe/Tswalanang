import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")
    const filePath = searchParams.get("filePath") // Path in storage bucket, e.g., "order_id/file_name.pdf"

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // 1. Delete record from 'documents' table
    const { error: dbError } = await supabase.from("documents").delete().eq("id", documentId)

    if (dbError) {
      console.error(`Error deleting document ${documentId} from database:`, dbError)
      return NextResponse.json({ error: "Failed to delete document record", details: dbError.message }, { status: 500 })
    }

    // 2. Delete file from Supabase Storage (if filePath is provided)
    if (filePath) {
      const { error: storageError } = await supabase.storage.from("documents").remove([filePath])

      if (storageError) {
        console.warn(
          `Warning: Failed to delete file from storage at ${filePath}. Database record was deleted.`,
          storageError,
        )
        // We don't return an error here, as the primary goal (database record deletion) was achieved.
        // This warning helps in debugging orphaned files.
      }
    } else {
      console.warn(`No filePath provided for document ${documentId}. Only database record deleted.`)
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/documents/delete:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
