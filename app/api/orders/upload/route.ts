import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { AuditLogger } from "@/lib/audit-logger"

// Supabase Configuration
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user ID from request headers or session
const getUserIdFromRequest = async (request: Request): Promise<string | null> => {
  try {
    // Try to get user from Supabase session
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      // Extract token and validate with Supabase
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)
      if (!error && user) {
        return user.id
      }
    }

    // Fallback: try to get from custom header (if set by client)
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

// 📌 Handle File Upload (POST)
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string
    const uploadedBy = formData.get("uploadedBy") as string
    const orderId = formData.get("orderId") as string
    const userId = await getUserIdFromRequest(request)

    if (!file || !documentType) {
      return NextResponse.json({ error: "File and document type are required." }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileKey = `uploads/${documentType}/${uuidv4()}-${file.name}`

    const { data, error } = await supabase.storage.from("documents").upload(fileKey, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
    })

    if (error) {
      throw new Error(`Supabase storage error: ${error.message}`)
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${fileKey}`
    const documentId = uuidv4()

    // Log document upload
    if (userId) {
      await AuditLogger.logDocumentUploaded(userId, documentId, {
        fileName: file.name,
        documentType: documentType,
        fileSize: file.size,
        orderId: orderId,
      })
    }

    return NextResponse.json({ message: "File uploaded successfully", fileUrl }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "File upload failed", details: error }, { status: 500 })
  }
}
