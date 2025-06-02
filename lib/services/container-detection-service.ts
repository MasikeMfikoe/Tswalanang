export interface ContainerInfo {
  prefix: string
  owner: string
  isValid: boolean
  type: "container" | "bl" | "booking"
}

export interface ShippingLineInfo {
  name: string
  code: string
  trackingUrl: string
  apiSupported: boolean
  containerPrefixes: string[]
  blPrefixes: string[]
  color: string
}

const shippingLines: Record<string, ShippingLineInfo> = {
  BMOU: {
    name: "Blue Star Maritime",
    code: "BLUE_STAR",
    trackingUrl: "https://www.bluestarferries.com/en/cargo-tracking?container=",
    apiSupported: false,
    containerPrefixes: ["BMOU"],
    blPrefixes: ["BMOU"],
    color: "#1e40af",
  },
  MAEU: {
    name: "Maersk",
    code: "MAERSK",
    trackingUrl: "https://www.maersk.com/tracking/",
    apiSupported: true,
    containerPrefixes: ["MAEU", "MRKU", "MSKU"],
    blPrefixes: ["MAEU"],
    color: "#0091da",
  },
  MSCU: {
    name: "MSC",
    code: "MSC",
    trackingUrl: "https://www.msc.com/track-a-shipment?agencyPath=msc&searchType=container&searchNumber=",
    apiSupported: true,
    containerPrefixes: ["MSCU", "MEDU"],
    blPrefixes: ["MSCU", "MEDI"],
    color: "#1c3f94",
  },
  CMAU: {
    name: "CMA CGM",
    code: "CMA_CGM",
    trackingUrl: "https://www.cma-cgm.com/ebusiness/tracking/",
    apiSupported: false,
    containerPrefixes: ["CMAU", "CXDU"],
    blPrefixes: ["CMDU"],
    color: "#0c1c5b",
  },
  HLXU: {
    name: "Hapag-Lloyd",
    code: "HAPAG_LLOYD",
    trackingUrl: "https://www.hapag-lloyd.com/en/online-business/tracing/tracing-by-booking.html?blno=",
    apiSupported: false,
    containerPrefixes: ["HLXU", "HLCU", "HPLU"],
    blPrefixes: ["HLCU"],
    color: "#d1001f",
  },
  COSU: {
    name: "COSCO",
    code: "COSCO",
    trackingUrl: "https://elines.coscoshipping.com/ebusiness/cargoTracking/",
    apiSupported: false,
    containerPrefixes: ["COSU", "CBHU"],
    blPrefixes: ["COSU"],
    color: "#dd1e25",
  },
  EVRU: {
    name: "Evergreen",
    code: "EVERGREEN",
    trackingUrl: "https://www.evergreen-line.com/static/jsp/cargo_tracking.jsp?",
    apiSupported: false,
    containerPrefixes: ["EVRU", "EGHU", "EVGU"],
    blPrefixes: ["EGLV"],
    color: "#00a84f",
  },
  OOLU: {
    name: "OOCL",
    code: "OOCL",
    trackingUrl: "https://www.oocl.com/eng/ourservices/eservices/cargotracking/",
    apiSupported: false,
    containerPrefixes: ["OOLU", "OOCU"],
    blPrefixes: ["OOLU"],
    color: "#0066cc",
  },
  ONEY: {
    name: "ONE",
    code: "ONE",
    trackingUrl: "https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?",
    apiSupported: false,
    containerPrefixes: ["ONEY", "ONEU"],
    blPrefixes: ["ONEE"],
    color: "#ff0099",
  },
}

export function detectContainerInfo(trackingNumber: string): ContainerInfo {
  const cleanNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

  if (cleanNumber.length < 4) {
    return {
      prefix: "",
      owner: "Unknown",
      isValid: false,
      type: "container",
    }
  }

  const prefix = cleanNumber.substring(0, 4)

  // Check if it's a valid container number format (4 letters + 6-7 digits)
  const containerPattern = /^[A-Z]{4}[0-9]{6,7}[0-9]?$/
  // Check if it's a Bill of Lading format (4 letters + 9-12 digits)
  const blPattern = /^[A-Z]{4}[0-9]{9,12}$/

  let type: "container" | "bl" | "booking" = "booking"

  if (containerPattern.test(cleanNumber)) {
    type = "container"
  } else if (blPattern.test(cleanNumber) || cleanNumber.length >= 9) {
    type = "bl"
  }

  const shippingLine = shippingLines[prefix]

  return {
    prefix,
    owner: shippingLine?.name || "Unknown Carrier",
    isValid: cleanNumber.length >= 6,
    type,
  }
}

export function getShippingLineInfo(prefix: string): ShippingLineInfo | null {
  return shippingLines[prefix] || null
}

export function buildTrackingUrl(trackingNumber: string, shippingLineInfo: ShippingLineInfo, type: string): string {
  return `${shippingLineInfo.trackingUrl}${trackingNumber}`
}
