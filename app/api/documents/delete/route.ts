import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { AuditLogger } from "@/lib/audit-logger"

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    // Try to get from authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) {
        return user.id
      }
    }

    // Fallback: try to get from custom header
    const userIdHeader = request.headers.get("x-user-id")
    if (userIdHeader) {
      return userIdHeader
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { documentId, orderId, filePath } = await request.json()
    const userId = await getUserIdFromRequest(request)

    console.log("🗑️ API: Starting document deletion:", { documentId, orderId })

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // First, verify the document exists and belongs to the order
    const { data: existingDoc, error: checkError } = await supabaseAdmin
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .eq("order_id", orderId)
      .single()

    if (checkError) {
      console.error("❌ API: Error checking document:", checkError)
      return NextResponse.json({ error: `Document not found: ${checkError.message}` }, { status: 404 })
    }

    if (!existingDoc) {
      console.error("❌ API: Document not found or does not belong to order")
      return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 })
    }

    console.log("✅ API: Document found:", existingDoc)

    // Delete from database using service role (bypasses RLS)
    const { error: dbError, count } = await supabaseAdmin
      .from("uploaded_documents")
      .delete({ count: "exact" })
      .eq("id", documentId)
      .eq("order_id", orderId)

    if (dbError) {
      console.error("❌ API: Database delete error:", dbError)
      return NextResponse.json({ error: `Failed to delete from database: ${dbError.message}` }, { status: 500 })
    }

    console.log("✅ API: Database deletion result - rows affected:", count)

    if (count === 0) {
      console.error("❌ API: No rows were deleted")
      return NextResponse.json({ error: "No rows were deleted - document may not exist" }, { status: 404 })
    }

    // Log document deletion
    if (userId) {
      await AuditLogger.logDocumentDeleted(userId, documentId, {
        fileName: existingDoc.file_name || "Unknown",
        documentType: existingDoc.document_type || "Unknown",
        orderId: orderId,
      })
    }

    // Try to delete from storage (non-critical)
    if (filePath) {
      try {
        const urlParts = filePath.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const storageFilePath = `documents/${fileName}`

        console.log("🗑️ API: Attempting to remove file from storage:", storageFilePath)
        const { error: storageError } = await supabaseAdmin.storage.from("documents").remove([storageFilePath])

        if (storageError) {
          console.warn("⚠️ API: Storage delete warning (non-critical):", storageError)
        } else {
          console.log("✅ API: File removed from storage")
        }
      } catch (storageError) {
        console.warn("⚠️ API: Storage cleanup failed (non-critical):", storageError)
      }
    }

    console.log("✅ API: Document deletion completed successfully")

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      deletedCount: count,
    })
  } catch (error: any) {
    console.error("💥 API: Delete error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to delete document",
      },
      { status: 500 },
    )
  }
}
