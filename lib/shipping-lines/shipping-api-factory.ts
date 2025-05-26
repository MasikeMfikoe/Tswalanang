import type { ShippingLine, ShippingLineCredentials } from "@/types/shipping"
import type { BaseShippingAPI } from "./base-shipping-api"
import { MaerskAPI } from "./maersk-api"
import { MSCAPI } from "./msc-api"

// Add more imports for other shipping lines as they are implemented

export class ShippingAPIFactory {
  static getApiClient(shippingLine: ShippingLine, credentials: ShippingLineCredentials): BaseShippingAPI {
    switch (shippingLine) {
      case "maersk":
        return new MaerskAPI(credentials)
      case "msc":
        return new MSCAPI(credentials)
      // Add cases for other shipping lines
      default:
        throw new Error(`Shipping line API not implemented: ${shippingLine}`)
    }
  }

  static getCredentials(shippingLine: ShippingLine): ShippingLineCredentials {
    // In a real implementation, these would come from environment variables or a secure store
    switch (shippingLine) {
      case "maersk":
        return {
          baseUrl: process.env.MAERSK_API_URL || "https://api.maersk.com",
          clientId: process.env.MAERSK_CLIENT_ID,
          clientSecret: process.env.MAERSK_CLIENT_SECRET,
        }
      case "msc":
        return {
          baseUrl: process.env.MSC_API_URL || "https://api.msc.com",
          username: process.env.MSC_USERNAME,
          password: process.env.MSC_PASSWORD,
        }
      // Add cases for other shipping lines
      default:
        throw new Error(`Credentials not configured for shipping line: ${shippingLine}`)
    }
  }
}
