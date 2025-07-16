export interface CarrierDetails {
  name: string
  code: string // e.g., MAERSK, ETHIOPIAN_AIRLINES
  trackingUrl: string
  apiSupported: boolean
  prefixes: string[] // Combined container/BL/AWB prefixes
  type: "ocean" | "air" | "lcl" | "unknown"
  color: string
}

export interface DetectedTrackingInfo {
  cleanNumber: string
  type: "container" | "bl" | "awb" | "booking" | "unknown"
  carrierDetails: CarrierDetails | null
  isValidFormat: boolean
  originalInput: string
}

export type TransportMode = "sea" | "air" | "unknown"

export interface DetectedInfo {
  mode: "sea" | "air" | null
  carrierCode?: string
  carrierName?: string
}

export interface ShippingLineInfo {
  carrierName?: string
  mode?: "sea" | "air"
}

const carriers: Record<string, CarrierDetails> = {
  // Ocean Carriers (Container/BL)
  BMOU: {
    name: "Blue Star Maritime",
    code: "BLUE_STAR",
    trackingUrl: "https://www.bluestarferries.com/en/cargo-tracking?container=",
    apiSupported: false,
    prefixes: ["BMOU"],
    type: "ocean",
    color: "#1e40af",
  },
  MAEU: {
    name: "Maersk",
    code: "MAERSK",
    trackingUrl: "https://www.maersk.com/tracking/",
    apiSupported: true,
    prefixes: ["MAEU", "MRKU", "MSKU", "MAEU"], // Added BL prefix
    type: "ocean",
    color: "#0091da",
  },
  MSCU: {
    name: "MSC",
    code: "MSC",
    trackingUrl: "https://www.msc.com/track-a-shipment?agencyPath=msc&searchType=container&searchNumber=",
    apiSupported: true,
    prefixes: ["MSCU", "MEDU", "MSCI", "MEDI"], // Added BL prefixes
    type: "ocean",
    color: "#1c3f94",
  },
  CMAU: {
    name: "CMA CGM",
    code: "CMA_CGM",
    trackingUrl: "https://www.cma-cgm.com/ebusiness/tracking/",
    apiSupported: false,
    prefixes: ["CMAU", "CXDU", "CMDU"], // Added BL prefix
    type: "ocean",
    color: "#0c1c5b",
  },
  HLXU: {
    name: "Hapag-Lloyd",
    code: "HAPAG_LLOYD",
    trackingUrl: "https://www.hapag-lloyd.com/en/online-business/tracing/tracing-by-booking.html?blno=",
    apiSupported: false,
    prefixes: ["HLXU", "HLCU", "HPLU"],
    type: "ocean",
    color: "#d1001f",
  },
  COSU: {
    name: "COSCO",
    code: "COSCO",
    trackingUrl: "https://elines.coscoshipping.com/ebusiness/cargoTracking/",
    apiSupported: false,
    prefixes: ["COSU", "CBHU"],
    type: "ocean",
    color: "#dd1e25",
  },
  EVRU: {
    name: "Evergreen",
    code: "EVERGREEN",
    trackingUrl: "https://www.evergreen-line.com/static/jsp/cargo_tracking.jsp?",
    apiSupported: false,
    prefixes: ["EVRU", "EGHU", "EVGU", "EGLV"], // Added BL prefix
    type: "ocean",
    color: "#00a84f",
  },
  OOLU: {
    name: "OOCL",
    code: "OOCL",
    trackingUrl: "https://www.oocl.com/eng/ourservices/eservices/cargotracking/",
    apiSupported: false,
    prefixes: ["OOLU", "OOCU"],
    type: "ocean",
    color: "#0066cc",
  },
  ONEY: {
    name: "ONE",
    code: "ONE",
    trackingUrl: "https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?",
    apiSupported: false,
    prefixes: ["ONEY", "ONEU", "ONEE"], // Added BL prefix
    type: "ocean",
    color: "#ff0099",
  },
  ZIMU: {
    name: "ZIM",
    code: "ZIM",
    trackingUrl: "https://www.zim.com/tools/track-a-shipment?container=",
    apiSupported: false,
    prefixes: ["ZIMU"],
    type: "ocean",
    color: "#800080",
  },
  YMLU: {
    name: "Yang Ming",
    code: "YANG_MING",
    trackingUrl: "https://www.yangming.com/e-service/Track_Trace/track_trace_cargo_tracking.aspx?container=",
    apiSupported: false,
    prefixes: ["YMLU"],
    type: "ocean",
    color: "#0055a4",
  },
  HMMU: {
    name: "HMM",
    code: "HMM",
    trackingUrl: "https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp?container=",
    apiSupported: false,
    prefixes: ["HMMU"],
    type: "ocean",
    color: "#e60023",
  },
  // Air Cargo Carriers (AWB) - IATA prefix (3 digits)
  "071": {
    name: "Ethiopian Airlines",
    code: "ETHIOPIAN_AIRLINES",
    trackingUrl: "https://www.ethiopianairlines.com/aa/trackyourshipment?awb=",
    apiSupported: false,
    prefixes: ["071"],
    type: "air",
    color: "#e03a3e",
  },
  "176": {
    name: "Emirates SkyCargo",
    code: "EMIRATES",
    trackingUrl: "https://www.skychain.emirates.com/Tracking/Tracking.aspx?awb=",
    apiSupported: false,
    prefixes: ["176"],
    type: "air",
    color: "#d10a11",
  },
  "014": {
    name: "American Airlines Cargo",
    code: "AMERICAN_AIRLINES",
    trackingUrl: "https://www.aacargo.com/track/?awb=",
    apiSupported: false,
    prefixes: ["014"],
    type: "air",
    color: "#2a628f",
  },
  "086": {
    name: "Qatar Airways Cargo",
    code: "QATAR_AIRWAYS",
    trackingUrl: "https://www.qrcargo.com/track-shipment?awb=",
    apiSupported: false,
    prefixes: ["086"],
    type: "air",
    color: "#8b0000",
  },
  "020": {
    name: "Lufthansa Cargo",
    code: "LUFTHANSA",
    trackingUrl: "https://lufthansa-cargo.com/tracking?awb=",
    apiSupported: false,
    prefixes: ["020"],
    type: "air",
    color: "#ffcc00",
  },
  "001": {
    name: "United Cargo",
    code: "UNITED_CARGO",
    trackingUrl: "https://www.unitedcargo.com/track?awb=",
    apiSupported: false,
    prefixes: ["001"],
    type: "air",
    color: "#002060",
  },
}

// Function to get a carrier by any of its prefixes
function getCarrierByPrefix(prefix: string): CarrierDetails | undefined {
  for (const carrierCode in carriers) {
    const carrier = carriers[carrierCode]
    if (carrier.prefixes.includes(prefix)) {
      return carrier
    }
  }
  return undefined
}

//  Shipping-line container codes (subset – extend as needed)
const SEA_PREFIX_MAP: Record<string, string> = {
  MSCU: "MSC",
  MAEU: "Maersk",
  CMAU: "CMA-CGM",
  HDMU: "HMM",
  // add more as required
}

//  IATA airline prefixes (subset – extend as needed)
const AIR_PREFIX_MAP: Record<string, string> = {
  "618": "Qatar Airways",
  "016": "United Airlines",
  "176": "Singapore Airlines",
  // add more as required
}

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Best-effort detection of transport mode and carrier information.
 * Exposed under two names to satisfy different call-sites.
 */
const SEA_CONTAINER_REGEX = /^[A-Z]{4}\d{7}$/ // e.g. MSCU1234567
const AIR_AWB_REGEX = /^\d{3}-\d{8}$/ // e.g. 618-12345678

export function detectContainerInfo(number: string): DetectedInfo {
  const trimmed = number.trim().toUpperCase()

  // Sea container (4 letters + 7 digits)
  if (SEA_CONTAINER_REGEX.test(trimmed)) {
    const prefix = trimmed.slice(0, 4)
    return {
      mode: "sea",
      carrierCode: prefix,
      carrierName: SEA_PREFIX_MAP[prefix],
    }
  }

  // Air-freight AWB (3 digits – 8 digits)
  if (AIR_AWB_REGEX.test(trimmed)) {
    const prefix = trimmed.split("-")[0]
    return {
      mode: "air",
      carrierCode: prefix,
      carrierName: AIR_PREFIX_MAP[prefix],
    }
  }

  // Unknown pattern
  return { mode: null }
}

/**
 * Get human-readable carrier information given a prefix or code.
 * Returns `null` if the prefix is unrecognised.
 */
export function getShippingLineInfo(prefix: string): ShippingLineInfo {
  const upper = prefix.toUpperCase()

  if (SEA_PREFIX_MAP[upper]) {
    return { carrierName: SEA_PREFIX_MAP[upper], mode: "sea" }
  }

  if (AIR_PREFIX_MAP[upper]) {
    return { carrierName: AIR_PREFIX_MAP[upper], mode: "air" }
  }

  return {}
}

export function getAllCarrierNames(): string[] {
  const names = new Set<string>()
  for (const key in carriers) {
    names.add(carriers[key].name)
  }
  return Array.from(names).sort()
}

export function getCarrierInfoByName(name: string): CarrierDetails | null {
  for (const key in carriers) {
    if (carriers[key].name === name) {
      return carriers[key]
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  Backward-compatibility aliases                                     */
/* ------------------------------------------------------------------ */
export const detectShipmentTrackingInfo = detectContainerInfo

/**
 * Alias for backwards-compatibility.
 * Returns the same object as detectContainerInfo.
 */
export const detectAirCargoInfo = detectContainerInfo

/**
 * Given a shipping-line prefix (e.g. "MSCU") **or** the carrier name
 * (e.g. "MSC"), return the matching CarrierDetails or null.
 */
export function getLegacyShippingLineInfo(prefixOrName: string): CarrierDetails | null {
  const query = prefixOrName.trim().toUpperCase()

  // 1️⃣  Try prefix match
  for (const key in carriers) {
    const carrier = carriers[key]
    if (carrier.prefixes.map((p) => p.toUpperCase()).includes(query)) {
      return carrier
    }
  }

  // 2️⃣  Try name match (case-insensitive)
  for (const key in carriers) {
    const carrier = carriers[key]
    if (carrier.name.toUpperCase() === query) {
      return carrier
    }
  }

  return null
}
