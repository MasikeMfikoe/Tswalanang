import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch API keys from a secure database
  // and ensure proper authentication and authorization.
  const apiKeys = [
    {
      id: "key_123",
      name: "SeaRates API Key",
      key: "sk_example_searates_123",
      lastUsed: "2024-07-15",
      status: "active",
    },
    { id: "key_456", name: "Gocomet API Key", key: "sk_example_gocomet_456", lastUsed: "2024-07-10", status: "active" },
    { id: "key_789", name: "Maersk API Key", key: "sk_example_maersk_789", lastUsed: "2024-07-01", status: "inactive" },
  ]
  return NextResponse.json(apiKeys)
}

export async function POST(request: Request) {
  const { name } = await request.json()
  // In a real application, generate a new secure API key and store it.
  const newKey = {
    id: `key_${Math.random().toString(36).substr(2, 9)}`,
    name,
    key: `sk_new_${Math.random().toString(36).substr(2, 16)}`,
    lastUsed: new Date().toISOString().split("T")[0],
    status: "active",
  }
  return NextResponse.json(newKey, { status: 201 })
}

export async function PUT(request: Request) {
  const { id, status } = await request.json()
  // In a real application, update the status of the API key in the database.
  return NextResponse.json({ message: `API Key ${id} status updated to ${status}` })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  // In a real application, delete the API key from the database.
  return NextResponse.json({ message: `API Key ${id} deleted` })
}
