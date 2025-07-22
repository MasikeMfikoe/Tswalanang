import { MaerskAPI } from "./maersk-api"
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
      default:
        throw new Error(`Unsupported shipping line: ${shippingLine}`)
    }
  }
}
