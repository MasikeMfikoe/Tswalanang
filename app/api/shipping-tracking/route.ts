import { type NextRequest, NextResponse } from "next/server"

interface TrackingNumberInfo {
  type: "container" | "bl" | "booking" | "unknown"
  shippingLine: string | null
  prefix: string
  isValid: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber, bookingType } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    console.log(`Processing tracking request for: ${trackingNumber}`)

    // Analyze the tracking number to determine type and shipping line
    const trackingInfo = analyzeTrackingNumber(trackingNumber)

    if (!trackingInfo.isValid) {
      return NextResponse.json(
        {
          error: "Invalid tracking number format. Please check your container number or Bill of Lading number.",
        },
        { status: 400 },
      )
    }

    // Generate comprehensive mock tracking data
    const mockTrackingData = generateMockTrackingData(trackingNumber, trackingInfo, bookingType)

    return NextResponse.json(mockTrackingData)
  } catch (error) {
    console.error("Shipping tracking error:", error)
    return NextResponse.json({ error: "Failed to process tracking request" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get("trackingNumber")
  console.log(`Fetching shipping tracking for: ${trackingNumber}`)
  return NextResponse.json({ trackingNumber, status: "In Transit", events: [] })
}

function generateMockTrackingData(trackingNumber: string, trackingInfo: TrackingNumberInfo, bookingType: string) {
  const shippingLineInfo = getShippingLineInfo(trackingInfo, trackingNumber)
  const now = new Date()

  // Generate realistic tracking events
  const events = [
    {
      status: "Booking Confirmed",
      location: "Shanghai, China",
      timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Booking confirmed and container allocated",
    },
    {
      status: "Container Loaded",
      location: "Shanghai Port, China",
      timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Container loaded onto vessel",
    },
    {
      status: "Vessel Departed",
      location: "Shanghai Port, China",
      timestamp: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Vessel departed from origin port",
    },
    {
      status: "In Transit",
      location: "Pacific Ocean",
      timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Container in transit on vessel",
    },
    {
      status: "Port of Discharge",
      location: "Los Angeles, USA",
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Vessel arrived at destination port",
    },
    {
      status: "Container Discharged",
      location: "Los Angeles Port, USA",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      details: "Container discharged from vessel",
    },
  ]

  const currentStatus = events[events.length - 1].status
  const currentLocation = events[events.length - 1].location

  return {
    containerNumber: trackingNumber,
    trackingType: trackingInfo.type,
    trackingNumberType: trackingInfo.type,
    status: currentStatus,
    location: currentLocation,
    timestamp: events[events.length - 1].timestamp,
    vessel: "MSC OSCAR",
    voyage: "MS2401E",
    eta: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    shippingLine: shippingLineInfo.name,
    trackingUrl: shippingLineInfo.url,
    message: `${trackingInfo.type === "container" ? "Container" : trackingInfo.type === "bl" ? "Bill of Lading" : "Booking"} tracking data retrieved successfully.`,
    events: events,
    origin: "Shanghai, China",
    destination: "Los Angeles, USA",
    cargoDetails: {
      weight: "24,500 kg",
      volume: "67.5 CBM",
      packages: "1,250 packages",
      containerType: "40' HC",
      commodity: "Electronics",
    },
    isRealData: false, // Clearly mark this as sample data
  }
}

function analyzeTrackingNumber(trackingNumber: string): TrackingNumberInfo {
  const cleanNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

  // Container number pattern: 4 letters + 7 digits (+ optional check digit)
  const containerPattern = /^[A-Z]{4}[0-9]{6,7}[0-9]?$/

  // Bill of Lading patterns (various formats)
  const blPatterns = [
    /^[A-Z]{4}[0-9]{9,12}$/, // Standard B/L: 4 letters + 9-12 digits
    /^[A-Z]{2,4}[0-9]{8,15}$/, // Variant B/L: 2-4 letters + 8-15 digits
    /^[0-9]{10,15}$/, // Numeric only B/L
    /^[A-Z]{3}[0-9]{8,12}$/, // 3 letters + 8-12 digits
  ]

  // Booking reference patterns
  const bookingPatterns = [
    /^[A-Z0-9]{6,12}$/, // Alphanumeric booking reference
    /^[A-Z]{2,3}[0-9]{6,10}$/, // Letters + numbers booking
  ]

  const prefix = cleanNumber.substring(0, 4)

  // Check if it's a container number
  if (containerPattern.test(cleanNumber)) {
    const shippingLine = detectShippingLineFromPrefix(prefix)
    return {
      type: "container",
      shippingLine,
      prefix,
      isValid: true,
    }
  }

  // Check if it's a Bill of Lading
  for (const pattern of blPatterns) {
    if (pattern.test(cleanNumber)) {
      const shippingLine = detectShippingLineFromPrefix(prefix)
      return {
        type: "bl",
        shippingLine,
        prefix,
        isValid: true,
      }
    }
  }

  // Check if it's a booking reference
  for (const pattern of bookingPatterns) {
    if (pattern.test(cleanNumber)) {
      const shippingLine = detectShippingLineFromPrefix(prefix)
      return {
        type: "booking",
        shippingLine,
        prefix,
        isValid: true,
      }
    }
  }

  // If no pattern matches, still try to detect shipping line from prefix
  const shippingLine = detectShippingLineFromPrefix(prefix)
  return {
    type: "unknown",
    shippingLine,
    prefix,
    isValid: cleanNumber.length >= 6, // Minimum length check
  }
}

function detectShippingLineFromPrefix(prefix: string): string | null {
  const prefixMap: Record<string, string> = {
    // Maersk
    MAEU: "maersk",
    MRKU: "maersk",
    MSKU: "maersk",

    // MSC
    MSCU: "msc",
    MEDU: "msc",

    // CMA CGM
    CMAU: "cma-cgm",
    CXDU: "cma-cgm",

    // Hapag-Lloyd
    HLXU: "hapag-lloyd",
    HLCU: "hapag-lloyd",
    HPLU: "hapag-lloyd",

    // COSCO
    COSU: "cosco",
    CBHU: "cosco",

    // Evergreen
    EVRU: "evergreen",
    EGHU: "evergreen",
    EVGU: "evergreen",

    // OOCL
    OOLU: "oocl",
    OOCU: "oocl",

    // ONE
    ONEY: "one",
    ONEU: "one",

    // Blue Star Maritime
    BMOU: "blue-star",

    // ZIM
    ZIMU: "zim",
    ZIMB: "zim",

    // Yang Ming
    YMLU: "yang-ming",
    YAMU: "yang-ming",

    // HMM
    HMMU: "hmm",

    // PIL
    PILU: "pil",

    // K Line
    KLNU: "k-line",

    // APL
    APLU: "apl",

    // MOL
    MOLU: "mol",

    // NYK
    NYKU: "nyk",

    // Wan Hai
    WHLU: "wan-hai",

    // UASC
    UASU: "uasc",

    // Arkas
    ARKU: "arkas",
  }

  return prefixMap[prefix] || null
}

function getShippingLineInfo(trackingInfo: TrackingNumberInfo, trackingNumber: string): { name: string; url: string } {
  const cleanNumber = trackingNumber.trim().replace(/[\s-]/g, "")

  switch (trackingInfo.shippingLine) {
    case "maersk":
      return {
        name: "Maersk",
        url:
          trackingInfo.type === "container"
            ? `https://www.maersk.com/tracking/${cleanNumber}`
            : `https://www.maersk.com/tracking?number=${cleanNumber}&type=bill-of-lading`,
      }

    case "msc":
      return {
        name: "MSC",
        url: `https://www.msc.com/track-a-shipment?agencyPath=msc&trackingNumber=${cleanNumber}`,
      }

    case "cma-cgm":
      return {
        name: "CMA CGM",
        url: `https://www.cma-cgm.com/ebusiness/tracking/search?number=${cleanNumber}`,
      }

    case "hapag-lloyd":
      return {
        name: "Hapag-Lloyd",
        url:
          trackingInfo.type === "container"
            ? `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${cleanNumber}`
            : `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?booking=${cleanNumber}`,
      }

    case "cosco":
      return {
        name: "COSCO Shipping",
        url: `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=${trackingInfo.type === "container" ? "CONTAINER" : "BOOKING"}&number=${cleanNumber}`,
      }

    case "evergreen":
      return {
        name: "Evergreen Line",
        url: `https://www.evergreen-line.com/emodal/stpb/stpb_show.do?lang=en&f_cmd=track&f_${trackingInfo.type === "container" ? "container_no" : "bl_no"}=${cleanNumber}`,
      }

    case "oocl":
      return {
        name: "OOCL",
        url: `https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx?${trackingInfo.type === "container" ? "ContainerNo" : "BLNo"}=${cleanNumber}`,
      }

    case "one":
      return {
        name: "ONE Line",
        url: `https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?trackingNumber=${cleanNumber}`,
      }

    case "blue-star":
      return {
        name: "Blue Star Maritime",
        url: `https://www.bluestarferries.com/en/cargo-tracking?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "zim":
      return {
        name: "ZIM",
        url: `https://www.zim.com/tools/track-a-shipment?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "yang-ming":
      return {
        name: "Yang Ming",
        url: `https://www.yangming.com/e-service/Track_Trace/track_trace_cargo_tracking.aspx?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "hmm":
      return {
        name: "HMM",
        url: `https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "pil":
      return {
        name: "PIL",
        url: `https://www.pilship.com/en--/120.html?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "k-line":
      return {
        name: "K Line",
        url: `https://www.kline.com/en/service/tracking?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "apl":
      return {
        name: "APL",
        url: `https://www.apl.com/ebusiness/tracking?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "mol":
      return {
        name: "MOL",
        url: `https://www.mol.co.jp/en/service/tracking/?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "nyk":
      return {
        name: "NYK Line",
        url: `https://www2.nyk.com/english/release/cargotracking/?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "wan-hai":
      return {
        name: "Wan Hai Lines",
        url: `https://www.wanhai-lines.com/service/tracking?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    case "uasc":
      return {
        name: "UASC (Hapag-Lloyd)",
        url: `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${cleanNumber}`,
      }

    case "arkas":
      return {
        name: "Arkas Line",
        url: `https://www.arkasline.com.tr/en/cargo-tracking?${trackingInfo.type === "container" ? "container" : "bl"}=${cleanNumber}`,
      }

    default:
      return {
        name: "Unknown Shipping Line",
        url: `https://www.google.com/search?q="${cleanNumber}"+${trackingInfo.type === "container" ? "container" : "bill+of+lading"}+tracking`,
      }
  }
}
