import { type NextRequest, NextResponse } from "next/server"
import { checkEmailAvailability } from "@/lib/user-validation"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await checkEmailAvailability(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Email availability check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
