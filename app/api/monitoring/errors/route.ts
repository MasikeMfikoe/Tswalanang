import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch error logs from your monitoring system or database
  const errors = [
    {
      id: "err_001",
      timestamp: "2024-07-19T08:00:00Z",
      level: "ERROR",
      message: "Failed to connect to external tracking API.",
      service: "tracking-service",
      count: 15,
    },
    {
      id: "err_002",
      timestamp: "2024-07-19T09:15:00Z",
      level: "WARNING",
      message: "Database connection pool exhausted.",
      service: "database",
      count: 3,
    },
    {
      id: "err_003",
      timestamp: "2024-07-19T10:30:00Z",
      level: "CRITICAL",
      message: "Payment gateway integration failed.",
      service: "payment-processor",
      count: 1,
    },
  ]
  return NextResponse.json(errors)
}

export async function POST(request: Request) {
  const { level, message, service } = await request.json()
  // In a real application, log the error to your monitoring system
  console.error(`New Error Logged: [${level}] ${service}: ${message}`)
  return NextResponse.json({ success: true, message: "Error logged successfully." }, { status: 201 })
}
