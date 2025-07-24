import type { BaseShippingAPI } from "./base-shipping-api"
import { MaerskAPI } from "./maersk-api"
import { MSCAPI } from "./msc-api"
import type { ShippingLine, ShippingLineCredentials } from "@/types/shipping"

export class ShippingAPIFactory {
  static getCredentials(shippingLine: ShippingLine): ShippingLineCredentials {
    switch (shippingLine) {
      case "maersk":
        return {
          baseUrl: process.env.MAERSK_API_URL || "",
          clientId: process.env.MAERSK_CLIENT_ID || "",
          clientSecret: process.env.MAERSK_CLIENT_SECRET || "",
        }
      case "msc":
        return {
          baseUrl: process.env.MSC_API_URL || "",
          username: process.env.MSC_USERNAME || "",
          password: process.env.MSC_PASSWORD || "",
        }
      default:
        throw new Error(`Unsupported shipping line: ${shippingLine}`)
    }
  }

  static hasValidCredentials(shippingLine: ShippingLine): boolean {
    try {
      const credentials = this.getCredentials(shippingLine)

      switch (shippingLine) {
        case "maersk":
          return !!(
            credentials.baseUrl &&
            credentials.clientId &&
            credentials.clientSecret &&
            credentials.clientId !== "undefined" &&
            credentials.clientSecret !== "undefined"
          )
        case "msc":
          return !!(
            credentials.baseUrl &&
            credentials.username &&
            credentials.password &&
            credentials.username !== "undefined" &&
            credentials.password !== "undefined"
          )
        default:
          return false
      }
    } catch (error) {
      return false
    }
  }

  static getApiClient(shippingLine: ShippingLine, credentials: ShippingLineCredentials) {
    switch (shippingLine) {
      case "maersk":
        return new MaerskAPI(credentials)
      case "msc":
        return new MSCAPI(credentials)
      default:
        throw new Error(`Unsupported shipping line: ${shippingLine}`)
    }
  }

  getApi(carrier: string): BaseShippingAPI | null {
    switch (carrier.toLowerCase()) {
      case "maersk":
        return new MaerskAPI()
      case "msc":
        return new MSCAPI()
      default:
        return null
    }
  }
}

export const shippingApiFactory = new ShippingAPIFactory()
