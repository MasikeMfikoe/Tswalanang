export type CarrierSuggestion = {
  name: string
  code: string
  type: ShipmentType
}

export type ShipmentType = "ocean" | "air" | "lcl" | "unknown"

export interface CarrierDetails {
  name: string
  code: string // e.g., MAERSK, ETHIOPIAN_AIRLINES
  trackingUrl: string
  apiSupported: boolean
  prefixes: string[] // Combined container/BL/AWB prefixes
  type: ShipmentType
  color: string
}

export interface DetectedTrackingInfo {
  cleanNumber: string
  type: "container" | "bl" | "awb" | "booking" | "unknown"
  carrierDetails: CarrierDetails | null
  isValidFormat: boolean
  originalInput: string
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
    prefixes: ["MAEU", "MRKU", "MSKU", "MRSU"], // Added MRSU prefix
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
  "157": {
    name: "Qatar Airways Cargo",
    code: "QATAR_AIRWAYS_157",
    trackingUrl: "https://www.qrcargo.com/track-shipment?awb=",
    apiSupported: false,
    prefixes: ["157"],
    type: "air",
    color: "#8b0000",
  },
  "297": {
    name: "China Airlines Cargo",
    code: "CHINA_AIRLINES",
    trackingUrl: "https://www.china-airlines.com/cargo/tracking?awb=",
    apiSupported: false,
    prefixes: ["297", "CHN"],
    type: "air",
    color: "#ff6600",
  },
}

// Define known carrier prefixes and AWB patterns
const OCEAN_PREFIXES: Record<string, string> = {
  MSKU: "Maersk",
  MAEU: "Maersk",
  MSCU: "MSC",
  CMAU: "CMA-CGM",
}

const AIR_PREFIXES: Record<string, string> = {
  "071": "Ethiopian",
  "176": "Emirates",
  "014": "American Airlines",
  "157": "Qatar Airways",
  "297": "China Airlines",
  CHN: "China Airlines",
}

const KNOWN_CARRIERS: CarrierSuggestion[] = [
  { name: "Maersk", code: "MAERSK", type: "ocean" },
  { name: "MSC", code: "MSC", type: "ocean" },
  { name: "CMA CGM", code: "CMA_CGM", type: "ocean" },
  { name: "Hapag-Lloyd", code: "HAPAG_LLOYD", type: "ocean" },
  { name: "COSCO", code: "COSCO", type: "ocean" },
  { name: "Evergreen", code: "EVERGREEN", type: "ocean" },
  { name: "OOCL", code: "OOCL", type: "ocean" },
  { name: "ONE (Ocean Network Express)", code: "ONE", type: "ocean" },
  { name: "Yang Ming", code: "YANG MING", type: "ocean" },
  { name: "PIL (Pacific International Lines)", code: "PIL", type: "ocean" },
  { name: "ZIM", code: "ZIM", type: "ocean" },
  { name: "American Airlines", code: "AA", type: "air" },
  { name: "United Airlines", code: "UA", type: "air" },
  { name: "Lufthansa Cargo", code: "LH", type: "air" },
  { name: "Emirates SkyCargo", code: "EK", type: "air" },
  { name: "FedEx", code: "FX", type: "air" },
  { name: "UPS", code: "UPS", type: "air" },
  { name: "DHL Express", code: "DHL", type: "air" },
  // Add more carriers as needed
]

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

export function detectShipmentTrackingInfo(trackingNumber: string): DetectedTrackingInfo {
  const originalInput = trackingNumber.trim()
  const cleanNumber = originalInput.toUpperCase().replace(/[\s-]/g, "")

  console.log(`[v0] 🔍 Detecting tracking info for: "${originalInput}" -> cleaned: "${cleanNumber}"`)

  let detectedType: "container" | "bl" | "awb" | "booking" | "unknown" = "unknown"
  let carrierDetails: CarrierDetails | null = null
  let isValidFormat = false

  // Attempt to detect Air Waybill (AWB) - usually 3-digit prefix + 8 digits (e.g., 071-12345678)
  const awbPattern = /^(\d{3})-?(\d{8})$/
  const awbMatch = cleanNumber.match(awbPattern)
  if (awbMatch) {
    const prefix = awbMatch[1]
    console.log(`[v0] 🛩️ AWB pattern matched with prefix: ${prefix}`)
    carrierDetails = getCarrierByPrefix(prefix)
    if (carrierDetails && carrierDetails.type === "air") {
      detectedType = "awb"
      isValidFormat = true
      console.log(`[v0] ✅ Air carrier detected: ${carrierDetails.name}`)
    }
  }

  // Special handling for CHN prefix (non-standard format)
  if (!isValidFormat && cleanNumber.startsWith("CHN")) {
    console.log(`[v0] 🛩️ CHN prefix detected`)
    carrierDetails = getCarrierByPrefix("CHN")
    if (carrierDetails && carrierDetails.type === "air") {
      detectedType = "awb"
      isValidFormat = true
      console.log(`[v0] ✅ China Airlines detected via CHN prefix`)
    }
  }

  // If not AWB, try to detect Container or Bill of Lading
  if (!isValidFormat) {
    // Container number pattern: 4 letters + 7 digits (e.g., XXXU1234567)
    const containerPattern = /^([A-Z]{4})(\d{7})$/
    const containerMatch = cleanNumber.match(containerPattern)
    if (containerMatch) {
      const prefix = containerMatch[1]
      console.log(`[v0] 🚢 Container pattern matched with prefix: ${prefix}`)
      carrierDetails = getCarrierByPrefix(prefix)
      if (carrierDetails && (carrierDetails.type === "ocean" || carrierDetails.type === "lcl")) {
        detectedType = "container"
        isValidFormat = true
        console.log(`[v0] ✅ Ocean carrier detected: ${carrierDetails.name}`)
      }
    }
  }

  // If not container/AWB, try to detect Bill of Lading (often 4 letters + variable digits)
  // Or generic booking reference (variable length, alphanumeric)
  if (!isValidFormat) {
    // Common BL pattern: 4 letters followed by 9-12 digits (example, MAEU123456789)
    const blPrefix = cleanNumber.substring(0, 4)
    carrierDetails = getCarrierByPrefix(blPrefix)
    if (carrierDetails && (carrierDetails.type === "ocean" || carrierDetails.type === "lcl")) {
      // Could be BL or Booking reference if it matches carrier prefix and has reasonable length
      // For simplicity, treat as 'bl' if it matches carrier prefix and has reasonable length
      if (cleanNumber.length >= 8 && cleanNumber.length <= 20) {
        // Arbitrary length for BL/Booking
        detectedType = "bl"
        isValidFormat = true
      }
    }
  }

  // Fallback to generic booking if it's alphanumeric and has a reasonable length
  if (!isValidFormat && cleanNumber.length >= 6 && cleanNumber.length <= 25 && /^[A-Z0-9]+$/.test(cleanNumber)) {
    detectedType = "booking"
    isValidFormat = true
    // Try to find a carrier based on first few characters if it's a booking reference, though less reliable
    const genericPrefix = cleanNumber.substring(0, 4)
    carrierDetails = getCarrierByPrefix(genericPrefix) || null
    if (carrierDetails && !["ocean", "air", "lcl"].includes(carrierDetails.type)) {
      // If the detected carrier is not explicitly ocean/air/lcl, revert to unknown carrier
      carrierDetails = null
    }
  }

  console.log(
    `[v0] 📊 Final detection result: type=${detectedType}, carrier=${carrierDetails?.name || "none"}, valid=${isValidFormat}`,
  )

  return {
    cleanNumber,
    type: detectedType,
    carrierDetails: carrierDetails,
    isValidFormat: isValidFormat,
    originalInput: originalInput,
  }
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

export function detectShipmentInfo(input: string): {
  type: ShipmentType
  carrierHint?: string
} {
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, "")

  // ----- Ocean / LCL (container) -----
  if (clean.length >= 4) {
    const oceanPrefix = clean.slice(0, 4)
    if (oceanPrefix in OCEAN_PREFIXES) {
      return { type: "ocean", carrierHint: OCEAN_PREFIXES[oceanPrefix] }
    }
  }

  // ----- Air (AWB) -----
  if (clean.length >= 3) {
    const airPrefix = clean.slice(0, 3)
    if (airPrefix in AIR_PREFIXES) {
      return { type: "air", carrierHint: AIR_PREFIXES[airPrefix] }
    }
  }

  return { type: "unknown" }
}

export function getCarrierSuggestions(text: string): CarrierSuggestion[] {
  const term = text.toUpperCase()
  const ocean = Object.entries(OCEAN_PREFIXES)
    .filter(([code, name]) => code.startsWith(term) || name.toUpperCase().includes(term))
    .map(([code, name]) => ({ code, name, type: "ocean" }))

  const air = Object.entries(AIR_PREFIXES)
    .filter(([code, name]) => code.startsWith(term) || name.toUpperCase().includes(term))
    .map(([code, name]) => ({ code, name, type: "air" }))

  return [...ocean, ...air].slice(0, 6)
}

// ---- Compatibility helpers for legacy imports ----

/**
 * Back-compat: alias for detectShipmentTrackingInfo that some modules import
 * as `detectContainerInfo`.
 */
export function detectContainerInfo(containerNumber: string) {
  return detectShipmentTrackingInfo(containerNumber)
}

/**
 * Back-compat: retrieves carrier details by prefix or full name.
 * Returns null if the carrier is not found.
 */
export function getShippingLineInfo(prefixOrName: string) {
  const key = prefixOrName.toUpperCase().trim()

  // Try direct prefix lookup first
  const carrierByPrefix = getCarrierByPrefix(key)
  if (carrierByPrefix) return carrierByPrefix

  // Fallback to lookup by name
  return getCarrierInfoByName(prefixOrName)
}
