import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch API keys from a database
  // For this example, we'll return mock data
  const apiKeys = [
    { id: "key_123", name: "GoComet Integration", key: "sk_gocomet_abc123", createdAt: "2023-01-15T10:00:00Z" },
    { id: "key_456", name: "SeaRates Access", key: "sk_searates_def456", createdAt: "2023-03-20T14:30:00Z" },
    { id: "key_789", name: "Internal Dashboard", key: "sk_internal_ghi789", createdAt: "2023-05-01T09:15:00Z" },
  ]
  return NextResponse.json(apiKeys)
}

export async function POST(request: Request) {
  const { name } = await request.json()
  // In a real application, you would generate a new API key and save it to a database
  const newKey = {
    id: `key_${Math.random().toString(36).substr(2, 9)}`,
    name,
    key: `sk_generated_${Math.random().toString(36).substr(2, 16)}`,
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json(newKey, { status: 201 })
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  // In a real application, you would delete the API key from the database
  console.log(`Deleting API key with ID: ${id}`)
  return NextResponse.json({ message: `API key ${id} deleted successfully` }, { status: 200 })
}
