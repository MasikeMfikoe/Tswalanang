import QRCode from "qrcode"

/**
 * Generates a QR code as a data URL
 * @param data The data to encode in the QR code
 * @param options Optional QR code generation options
 * @returns Promise resolving to a data URL string
 */
export async function generateQRCode(data: string, options = {}): Promise<string> {
  try {
    const defaultOptions = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }

    const mergedOptions = { ...defaultOptions, ...options }
    return await QRCode.toDataURL(data, mergedOptions)
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

/**
 * Generates a delivery confirmation URL
 * @param orderId The order ID
 * @param token Security token for verification
 * @returns The delivery confirmation URL
 */
export function generateDeliveryConfirmationUrl(orderId: string, token: string): string {
  // In production, this would use an environment variable for the base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://logistics.example.com"
  return `${baseUrl}/delivery-confirmation/${orderId}?token=${token}`
}

/**
 * Generates a secure token for delivery confirmation
 * @param orderId The order ID
 * @param expiryDays Number of days until the token expires
 * @returns A secure token string
 */
export function generateSecureToken(orderId: string, expiryDays = 7): string {
  // In a real implementation, this would use a proper crypto library
  // and include expiration logic
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // This is a simplified implementation - in production use a proper JWT or similar
  const tokenData = {
    orderId,
    expiry: expiryDate.toISOString(),
    random: Math.random().toString(36).substring(2),
  }

  return Buffer.from(JSON.stringify(tokenData)).toString("base64")
}

// Placeholder content for lib/qr-code-utils.ts
export function generateQrCode(data: string) {
  console.log(`Generating QR code for: ${data}`)
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
}
