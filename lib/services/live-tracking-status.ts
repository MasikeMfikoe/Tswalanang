import { ShippingAPIFactory } from "../shipping-lines/shipping-api-factory"

export interface LiveTrackingStatus {
  carrierName: string
  isLiveSupported: boolean
  hasCredentials: boolean
  status: "active" | "inactive" | "no-credentials" | "unsupported"
}

export function getLiveTrackingStatus(): LiveTrackingStatus[] {
  const carriers = [
    { name: "Maersk", code: "maersk" as const },
    { name: "CMA CGM", code: "cma-cgm", supported: false },
    { name: "Hapag-Lloyd", code: "hapag-lloyd", supported: false },
    { name: "ONE", code: "one", supported: false },
    { name: "COSCO", code: "cosco", supported: false },
  ]

  return carriers.map((carrier) => {
    const isSupported = carrier.supported !== false
    let hasCredentials = false
    let status: LiveTrackingStatus["status"] = "unsupported"

    if (isSupported && carrier.code !== "cma-cgm") {
      try {
        hasCredentials = ShippingAPIFactory.hasValidCredentials(carrier.code)
        status = hasCredentials ? "active" : "no-credentials"
      } catch {
        status = "no-credentials"
      }
    }

    return {
      carrierName: carrier.name,
      isLiveSupported: isSupported,
      hasCredentials,
      status,
    }
  })
}

export function getActiveLiveCarriers(): string[] {
  return getLiveTrackingStatus()
    .filter((carrier) => carrier.status === "active")
    .map((carrier) => carrier.carrierName)
}
