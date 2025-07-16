import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const imo = req.nextUrl.searchParams.get("imo")
  if (!imo) {
    return NextResponse.json({ error: "Missing IMO" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://services.marinetraffic.com/api/exportvessel/v:8/${process.env.MARINE_TRAFFIC_API_KEY}/imo:${imo}`,
    )

    if (!res.ok) {
      return NextResponse.json({ error: "MarineTraffic error", status: res.status }, { status: res.status })
    }

    const data = await res.text() // MarineTraffic often returns CSV / text
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", message: err.message }, { status: 500 })
  }
}
