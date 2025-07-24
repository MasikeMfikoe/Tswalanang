import { ShippingAPIFactory } from "../shipping-lines/shipping-api-factory"

export interface LiveTrackingStatus {
  carrierName: string
  isLiveSupported: boolean
  hasCredentials: boolean
  status: "active" | "inactive" | "no-credentials" | "unsupported"
}

export async function getLiveTrackingStatus(trackingNumber: string): Promise<{ status: string; location: string }> {
  const carriers = [
    { name: "Maersk", code: "maersk" as const },
    { name: "MSC", code: "msc" as const },
    { name: "CMA CGM", code: "cma-cgm", supported: false },
    { name: "Hapag-Lloyd", code: "hapag-lloyd", supported: false },
    { name: "ONE", code: "one", supported: false },
    { name: "COSCO", code: "cosco", supported: false },
  ]

  const liveTrackingStatuses = carriers.map((carrier) => {
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

  const activeCarriers = liveTrackingStatuses
    .filter((carrier) => carrier.status === "active")
    .map((carrier) => carrier.carrierName)

  const trackingStatus = await ShippingAPIFactory.getTrackingStatus(trackingNumber, activeCarriers)

  return trackingStatus
}

export function getActiveLiveCarriers(): string[] {
  return getLiveTrackingStatus("")
    .then((status) => [])
    .catch((error) => [])
}
