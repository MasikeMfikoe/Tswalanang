import { NextResponse } from "next/server"
import { getVesselPosition } from "@/lib/services/marinetraffic-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imo = searchParams.get("imo")

  if (!imo) {
    return NextResponse.json({ error: "IMO number is required" }, { status: 400 })
  }

  try {
    const position = await getVesselPosition(imo)
    if (position) {
      return NextResponse.json(position)
    } else {
      return NextResponse.json({ message: "Vessel position not found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("Error fetching vessel position:", error)
    return NextResponse.json({ error: "Failed to fetch vessel position", details: error.message }, { status: 500 })
  }
}
