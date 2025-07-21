import { NextResponse } from "next/server"

/**
 * POST /api/gocomet-auth
 *
 * Returns:
 *   { success: true, token: string }  – when authentication succeeds
 *   { success: false, error: string } – when something goes wrong
 *
 * Notes:
 *  • No request body is required; credentials are read from env vars.
 *  • Falls back to NEXT_PUBLIC_ vars for local testing but you should store
 *    GOCOMET_EMAIL and GOCOMET_PASSWORD *without* NEXT_PUBLIC_ in production.
 */
export async function POST() {
  try {
    // -----------------------------------------------------------------------
    // 1. Read credentials from environment variables
    // -----------------------------------------------------------------------
    const email = process.env.GOCOMET_EMAIL || process.env.NEXT_PUBLIC_GOCOMET_EMAIL
    const password = process.env.GOCOMET_PASSWORD || process.env.NEXT_PUBLIC_GOCOMET_PASSWORD

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "GoComet credentials are not configured." }, { status: 500 })
    }

    // -----------------------------------------------------------------------
    // 2. Forward the login request to GoComet
    //    Using the previously working endpoint for token generation.
    // -----------------------------------------------------------------------
    const resp = await fetch("https://login.gocomet.com/api/v1/integrations/generate-token-number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    // GoComet sometimes returns non-JSON on error; guard against that:
    const text = await resp.text()
    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      // leave data as {}
    }

    if (resp.ok && data.token) {
      return NextResponse.json({ success: true, token: data.token })
    }

    const message = data?.message || data?.error || `GoComet auth failed with status ${resp.status}`
    return NextResponse.json({ success: false, error: message }, { status: resp.status || 500 })
  } catch (err: any) {
    console.error("GoComet auth route error:", err)
    return NextResponse.json({ success: false, error: "Internal server error during GoComet auth." }, { status: 500 })
  }
}
