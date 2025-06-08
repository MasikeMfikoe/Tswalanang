import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Container detection function
export function detectContainerInfo(trackingNumber: string) {
  const cleanNumber = trackingNumber.replace(/\s+/g, "").toUpperCase()

  // Container number pattern: 4 letters + 7 digits
  const containerPattern = /^([A-Z]{4})(\d{7})$/
  const match = cleanNumber.match(containerPattern)

  if (match) {
    return {
      isValid: true,
      prefix: match[1],
      number: match[2],
      type: "container" as const,
      fullNumber: cleanNumber,
    }
  }

  // Bill of lading or booking reference
  if (cleanNumber.length >= 6 && cleanNumber.length <= 20) {
    return {
      isValid: true,
      prefix: cleanNumber.substring(0, 4),
      number: cleanNumber.substring(4),
      type: "booking" as const,
      fullNumber: cleanNumber,
    }
  }

  return {
    isValid: false,
    prefix: "",
    number: "",
    type: "unknown" as const,
    fullNumber: cleanNumber,
  }
}

// External tracking function
export async function trackContainerExternal(trackingNumber: string) {
  try {
    const containerInfo = detectContainerInfo(trackingNumber)

    if (!containerInfo.isValid) {
      return {
        success: false,
        error: "Invalid tracking number format",
        source: "validation",
      }
    }

    // Mock response for now - replace with actual API calls
    return {
      success: true,
      data: {
        containerNumber: trackingNumber,
        status: "In Transit",
        location: "Port of Loading",
        vessel: "Unknown",
        voyage: "Unknown",
        eta: "Unknown",
        events: [
          {
            status: "In Transit",
            location: "Port of Loading",
            timestamp: new Date().toISOString(),
            description: "Container loaded on vessel",
          },
        ],
        cargoDetails: {
          containerType: "20GP",
          weight: "Unknown",
          volume: "Unknown",
        },
      },
      source: "mock_api",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch tracking data",
      source: "external_api",
    }
  }
}
