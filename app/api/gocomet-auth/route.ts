import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  try {
    const response = await fetch("https://api.gocomet.com/api/v1/integrations/generate-token-number", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("GoComet API error:", response.status, errorData)
      return NextResponse.json(
        { error: `GoComet login failed with status ${response.status}: ${JSON.stringify(errorData)}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ token: data.data.token })
  } catch (error: any) {
    console.error("Error during GoComet authentication:", error)
    return NextResponse.json({ error: `Authentication error: ${error.message}` }, { status: 500 })
  }
}
