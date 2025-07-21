import type { CarrierSuggestion, ShipmentType } from "@/types/tracking"

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

export interface DetectedShipmentInfo {
  type: ShipmentType
  carrierHint?: string
  isValid: boolean
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

// Regex patterns for common tracking numbers
const trackingPatterns = {
  // Ocean container numbers (e.g., MEDU9445622) - 4 letters, 6 digits, 1 check digit
  ocean: /^[A-Z]{4}\d{7}$/,
  // Air Waybill (AWB) numbers (e.g., 001-12345678) - 3 digits, hyphen, 8 digits
  air: /^\d{3}-?\d{8}$/,
  // Parcel tracking numbers (examples, highly variable)
  parcel: /^(UPS|FEDEX|DHL|USPS)\d+$/i, // Very basic, needs more specific patterns
}

// A simplified list of carriers and their typical tracking number prefixes/formats
const carrierPrefixes: { [key: string]: { type: ShipmentType; patterns: RegExp[] } } = {
  MAERSK: { type: "ocean", patterns: [/^MAEU/, /^MSCU/] },
  MSC: { type: "ocean", patterns: [/^MEDU/, /^MSCU/] }, // MSC also uses MSCU
  CMA: { type: "ocean", patterns: [/^CMDU/] },
  COSCO: { type: "ocean", patterns: [/^COSU/] },
  EVERGREEN: { type: "ocean", patterns: [/^EGHU/] },
  HAPAGLLOYD: { type: "ocean", patterns: [/^HLXU/] },
  ONE: { type: "ocean", patterns: [/^ONEY/] },
  OOCL: { type: "ocean", patterns: [/^OOLU/] },
  PIL: { type: "ocean", patterns: [/^PCLU/] },
  YANGMING: { type: "ocean", patterns: [/^YMLU/] },
  ZIM: { type: "ocean", patterns: [/^ZIMU/] },
  // Air cargo prefixes (IATA airline codes)
  "LUFTHANSA CARGO": { type: "air", patterns: [/^020-/, /^020/] },
  "BRITISH AIRWAYS CARGO": { type: "air", patterns: [/^125-/, /^125/] },
  "EMIRATES SKYCARGO": { type: "air", patterns: [/^176-/, /^176/] },
  "QATAR AIRWAYS CARGO": { type: "air", patterns: [/^157-/, /^157/] },
  "SINGAPORE AIRLINES CARGO": { type: "air", patterns: [/^618-/, /^618/] },
  // Parcel carriers (examples)
  UPS: { type: "parcel", patterns: [/^(1Z|T)\d{16}$/] },
  FEDEX: { type: "parcel", patterns: [/^\d{12}$/, /^\d{15}$/, /^\d{20}$/] },
  DHL: { type: "parcel", patterns: [/^\d{10}$/, /^\d{11}$/, /^\d{14}$/, /^[A-Z]{3}\d{7,10}$/] },
  USPS: { type: "parcel", patterns: [/^\d{20}$/, /^\d{22}$/, /^\d{26}$/, /^9\d{15,21}$/] },
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

export function detectShipmentTrackingInfo(trackingNumber: string): DetectedTrackingInfo {
  const originalInput = trackingNumber.trim()
  const cleanNumber = originalInput.toUpperCase().replace(/[\s-]/g, "")

  let detectedType: "container" | "bl" | "awb" | "booking" | "unknown" = "unknown"
  let carrierDetails: CarrierDetails | null = null
  let isValidFormat = false

  // Attempt to detect Air Waybill (AWB) - usually 3-digit prefix + 8 digits (e.g., 071-12345678)
  const awbPattern = /^(\d{3})-?(\d{8})$/
  const awbMatch = cleanNumber.match(awbPattern)
  if (awbMatch) {
    const prefix = awbMatch[1]
    carrierDetails = getCarrierByPrefix(prefix)
    if (carrierDetails && carrierDetails.type === "air") {
      detectedType = "awb"
      isValidFormat = true
    }
  }

  // If not AWB, try to detect Container or Bill of Lading
  if (!isValidFormat) {
    // Container number pattern: 4 letters + 7 digits (e.g., XXXU1234567)
    const containerPattern = /^([A-Z]{4})(\d{7})$/
    const containerMatch = cleanNumber.match(containerPattern)
    if (containerMatch) {
      const prefix = containerMatch[1]
      carrierDetails = getCarrierByPrefix(prefix)
      if (carrierDetails && (carrierDetails.type === "ocean" || carrierDetails.type === "lcl")) {
        detectedType = "container"
        isValidFormat = true
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
      // Could be BL or Booking reference if it starts with a known ocean carrier prefix
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

/**
 * Detects the shipment type and potentially a carrier hint based on the tracking number format.
 * @param trackingNumber The input tracking number.
 * @returns An object containing the detected type, carrier hint, and validity.
 */
export function detectShipmentInfo(trackingNumber: string): DetectedShipmentInfo {
  const cleanedNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

  // 1. Check for specific carrier prefixes/patterns first
  for (const carrierName in carrierPrefixes) {
    const { type, patterns } = carrierPrefixes[carrierName]
    for (const pattern of patterns) {
      if (pattern.test(cleanedNumber)) {
        return { type, carrierHint: carrierName, isValid: true }
      }
    }
  }

  // 2. Check general format patterns
  if (trackingPatterns.ocean.test(cleanedNumber)) {
    return { type: "ocean", isValid: true }
  }
  if (trackingPatterns.air.test(cleanedNumber)) {
    return { type: "air", isValid: true }
  }
  // Add more general patterns for LCL, parcel if available

  return { type: "unknown", isValid: false }
}

/**
 * Provides carrier suggestions based on the input tracking number.
 * This is a simplified example and would ideally use a more robust lookup.
 * @param trackingNumber The input tracking number.
 * @returns An array of potential carrier suggestions.
 */
export function getCarrierSuggestions(trackingNumber: string): CarrierSuggestion[] {
  const cleanedNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")
  const suggestions: CarrierSuggestion[] = []

  // Iterate through known carriers and see if their patterns match
  for (const carrierName in carrierPrefixes) {
    const { type, patterns } = carrierPrefixes[carrierName]
    for (const pattern of patterns) {
      if (pattern.test(cleanedNumber)) {
        suggestions.push({ name: carrierName, code: carrierName, type })
        break // Add only one suggestion per carrier
      }
    }
  }

  // If no specific carrier detected, but it matches a general type, suggest common carriers for that type
  if (suggestions.length === 0) {
    if (trackingPatterns.ocean.test(cleanedNumber)) {
      suggestions.push(
        { name: "Maersk", code: "MAERSK", type: "ocean" },
        { name: "MSC", code: "MSC", type: "ocean" },
        { name: "CMA CGM", code: "CMA", type: "ocean" },
      )
    } else if (trackingPatterns.air.test(cleanedNumber)) {
      suggestions.push(
        { name: "Lufthansa Cargo", code: "LH", type: "air" },
        { name: "Emirates SkyCargo", code: "EK", type: "air" },
      )
    }
  }

  // Remove duplicates if any
  return Array.from(new Map(suggestions.map((s) => [s.code, s])).values())
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

// Function to detect shipment info using common prefixes
export function detectShipmentInfoLegacy(trackingNumber: string): {
  type: ShipmentType | "unknown"
  carrier: string | "Unknown"
} {
  trackingNumber = trackingNumber.toUpperCase().replace(/\s/g, "") // Normalize input

  // Check for Ocean Container (ISO 6346)
  // Format: XXXU1234567 (4 letters, 7 digits)
  const oceanMatch = trackingNumber.match(/^([A-Z]{3}U)(\d{7})$/)
  if (oceanMatch) {
    const prefix = oceanMatch[1]
    const carrier = "OCEAN_PREFIXES"[prefix]
    if (carrier) {
      return { type: "ocean", carrier: carrier }
    }
  }

  // Check for Air Waybill
  // Format: 123-12345678 or 12312345678 (3 digits, optional hyphen, 8 digits)
  const airWaybillMatch = trackingNumber.match(/^(\d{3})-?(\d{8})$/)
  if (airWaybillMatch) {
    const prefix = airWaybillMatch[1]
    const carrier = "AIR_CARRIERS"[prefix]
    if (carrier) {
      return { type: "air", carrier: carrier }
    }
  }

  // Add logic for other types of tracking numbers (e.g., parcel, rail) if applicable
  // Example for a generic parcel:
  // if (trackingNumber.length > 10 && trackingNumber.length < 30 && /^[A-Z0-9]+$/.test(trackingNumber)) {
  //   return { type: "parcel", carrier: "Generic Parcel Carrier" };
  // }

  return { type: "unknown", carrier: "Unknown" }
}
