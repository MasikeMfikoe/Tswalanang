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

export interface CarrierInfo {
  name: string
  type: "sea" | "air"
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
  WANH: {
    name: "Wan Hai Lines",
    code: "WAN_HAI_LINES",
    trackingUrl: "https://www.wanhai.com/en/track-trace/",
    apiSupported: false,
    prefixes: ["WANH"],
    type: "ocean",
    color: "#000000",
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
  "618": {
    name: "DHL Aviation",
    code: "DHL_AVIATION",
    trackingUrl: "https://www.dhl.com/en/express/tracking.html?AWB=",
    apiSupported: false,
    prefixes: ["618"],
    type: "air",
    color: "#000000",
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
  WANH: "Wan Hai Lines",
  // add more as required
}

//  IATA airline prefixes (subset – extend as needed)
const AIR_PREFIX_MAP: Record<string, string> = {
  "618": "DHL Aviation",
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

type Mode = "sea" | "air" | "unknown"

interface DetectionResult {
  mode: Mode
  carrierPrefix?: string
}

/**
 * Detect transport mode (sea container vs air waybill) and extract the prefix.
 *  • Sea containers: 4-letter prefix + 7 digits (e.g. MSCU1234567)
 *  • Air waybills : 3-digit IATA prefix + 8 digits (e.g. 618-12345678)
 */
export function detectContainerInfo(number: string): { mode: Mode; carrierPrefix?: string } {
  if (!number) return { mode: "unknown" }

  const upper = number.trim().toUpperCase()

  // Check 3-digit IATA prefixes for air waybills
  const iata = upper.slice(0, 3)
  if (/^\d{3}$/.test(iata) && CARRIER_PREFIXES[iata]) {
    return { mode: "air", carrierPrefix: iata }
  }

  // Check 4-letter ocean container prefixes
  const oceanPrefix = upper.slice(0, 4)
  if (/^[A-Z]{4}$/.test(oceanPrefix) && CARRIER_PREFIXES[oceanPrefix]) {
    return { mode: "sea", carrierPrefix: oceanPrefix }
  }

  // Fallback simple heuristics
  if (/^[A-Z]{4}\d{7}$/.test(upper)) return { mode: "sea" }
  if (/^\d{11}$/.test(upper)) return { mode: "air" }

  return { mode: "unknown" }
}

/**
 * Look up a readable carrier name from a known prefix.
 * Extend these tables as required.
 */
const SEA_PREFIX_TABLE: Record<string, string> = {
  MSCU: "Mediterranean Shipping Co (MSC)",
  MAEU: "Maersk",
  CMAU: "CMA CGM",
}

const AIR_PREFIX_TABLE: Record<string, string> = {
  "618": "Emirates SkyCargo",
  "176": "Air France",
}

const CARRIER_PREFIXES: Record<string, { name: string; mode: Mode }> = {
  MSCU: { name: "MSC", mode: "sea" },
  MAEU: { name: "Maersk", mode: "sea" },
  CMAU: { name: "CMA-CGM", mode: "sea" },
  ONEU: { name: "Ocean Network Express", mode: "sea" },
  "618": { name: "DHL Aviation", mode: "air" }, // IATA prefix example
}

// Define known shipping line prefixes and their full names
const SHIPPING_LINE_PREFIXES: Record<string, CarrierInfo> = {
  MSCU: { name: "MSC", type: "sea" },
  MAEU: { name: "Maersk", type: "sea" },
  HLXU: { name: "Hapag-Lloyd", type: "sea" },
  APLU: { name: "APL", type: "sea" },
  CMDU: { name: "CMA CGM", type: "sea" },
  NYKU: { name: "NYK Line", type: "sea" },
  OOLU: { name: "OOCL", type: "sea" },
  PONU: { name: "PIL", type: "sea" },
  SUDU: { name: "Hamburg Süd", type: "sea" },
  TLLU: { name: "T.S. Lines", type: "sea" },
  WANH: { name: "Wan Hai Lines", type: "sea" },
  // Add more as needed
}

// Define known airline prefixes (IATA codes)
const AIRLINE_PREFIXES: Record<string, CarrierInfo> = {
  "001": { name: "American Airlines", type: "air" },
  "005": { name: "United Airlines", type: "air" },
  "014": { name: "Air Canada", type: "air" },
  "020": { name: "Lufthansa", type: "air" },
  "023": { name: "Delta Air Lines", type: "air" },
  "074": { name: "KLM", type: "air" },
  "083": { name: "British Airways", type: "air" },
  "105": { name: "Finnair", type: "air" },
  "117": { name: "Air France", type: "air" },
  "160": { name: "SAS", type: "air" },
  "180": { name: "Korean Air", type: "air" },
  "235": { name: "Cathay Pacific", type: "air" },
  "618": { name: "DHL Aviation", type: "air" },
  // Add more as needed
}

export function detectShipmentTrackingInfo(trackingNumber: string) {
  trackingNumber = trackingNumber.trim().toUpperCase()

  // Sea Freight (Container Numbers)
  // Format: 4 letters + 6 digits + 1 check digit (e.g., MSCU1234567)
  const containerRegex = /^[A-Z]{4}\d{7}$/
  if (containerRegex.test(trackingNumber)) {
    const shippingLinePrefix = trackingNumber.substring(0, 4)
    const shippingLine = getShippingLineInfo(shippingLinePrefix)
    return {
      type: "ocean",
      mode: "FCL", // Full Container Load by default
      carrier: shippingLine?.name || "Unknown Carrier",
      carrierCode: shippingLinePrefix,
      trackingNumber: trackingNumber,
    }
  }

  // Air Freight (AWB - Air Waybill)
  // Format: 3-digit airline prefix + 8-digit serial number (e.g., 001-12345678)
  const awbRegex = /^\d{3}-?\d{8}$/
  if (awbRegex.test(trackingNumber)) {
    const airlinePrefix = trackingNumber.substring(0, 3)
    const airline = getShippingLineInfo(airlinePrefix) // Re-using for airline lookup
    return {
      type: "air",
      mode: "AWB",
      carrier: airline?.name || "Unknown Airline",
      carrierCode: airlinePrefix,
      trackingNumber: trackingNumber.replace(/-/g, ""), // Remove hyphen for consistent tracking
    }
  }

  // Bill of Lading (B/L) - often alphanumeric, can be complex
  // This is a very generic check, might need more specific regex for different carriers
  // For simplicity, if it's not container or AWB, assume it might be a B/L
  if (trackingNumber.length >= 8 && trackingNumber.length <= 20) {
    return {
      type: "ocean", // Most common for B/L
      mode: "LCL", // Less than Container Load by default for B/L
      carrier: "Unknown Carrier", // Cannot easily determine carrier from B/L alone
      trackingNumber: trackingNumber,
    }
  }

  return {
    type: "unknown",
    mode: "unknown",
    carrier: "Unknown",
    trackingNumber: trackingNumber,
  }
}

export function getShippingLineInfo(prefix: string) {
  const normalizedPrefix = prefix.toUpperCase()
  const carriers = [
    { prefix: "MSCU", name: "MSC" },
    { prefix: "MAEU", name: "Maersk" },
    { prefix: "CMAU", name: "CMA CGM" },
    { prefix: "HLXU", name: "Hapag-Lloyd" },
    { prefix: "ONEU", name: "Ocean Network Express (ONE)" },
    { prefix: "APLU", name: "APL" },
    { prefix: "COSCO", name: "COSCO Shipping" },
    { prefix: "PILU", name: "Pacific International Lines (PIL)" },
    { prefix: "ZIMU", name: "ZIM Integrated Shipping Services" },
    { prefix: "NYKU", name: "NYK Line" },
    { prefix: "EVER", name: "Evergreen Line" },
    { prefix: "YMLU", name: "Yang Ming Marine Transport Corporation" },
    { prefix: "KLINE", name: "K Line" },
    { prefix: "HMMU", name: "HMM" },
    { prefix: "WANH", name: "Wan Hai Lines" },
    { prefix: "OOCL", name: "Orient Overseas Container Line (OOCL)" },
    // Airlines (IATA codes)
    { prefix: "001", name: "American Airlines" },
    { prefix: "002", name: "Air China" },
    { prefix: "003", name: "Air France" },
    { prefix: "004", name: "Lufthansa" },
    { prefix: "005", name: "British Airways" },
    { prefix: "006", name: "Delta Air Lines" },
    { prefix: "007", name: "United Airlines" },
    { prefix: "008", name: "Emirates" },
    { prefix: "009", name: "Qatar Airways" },
    { prefix: "010", name: "Singapore Airlines" },
    { prefix: "618", name: "DHL Aviation" }, // Common for DHL Express
  ]

  return carriers.find(
    (carrier) => carrier.prefix === normalizedPrefix || carrier.name.toUpperCase() === normalizedPrefix,
  )
}

// Re-export with the expected alias;

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
