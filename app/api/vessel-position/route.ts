import { NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imo = searchParams.get("imo")

  if (!imo) {
    return NextResponse.json({ success: false, error: "IMO is required" }, { status: 400 })
  }

  const service = new MarineTrafficService(process.env.MARINE_TRAFFIC_API_KEY || "")

  try {
    const data = await service.getVesselPosition(imo)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message ?? "Unknown error" }, { status: 500 })
  }
}
