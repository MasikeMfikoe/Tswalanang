import { supabase } from "@/lib/supabaseClient"
import { shippingApiFactory } from "@/lib/shipping-lines/shipping-api-factory"
import type { ShipmentUpdate, ShippingLine, UpdateConfig } from "@/types/shipping"
import { v4 as uuidv4 } from "uuid"

export class ShippingUpdateService {
  // Get shipments that need updates
  async getShipmentsForUpdate(limit = 10): Promise<any[]> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .lt("next_update_time", now)
        .order("next_update_time")
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error getting shipments for update:", error)
      return []
    }
  }

  // Update a single shipment
  async updateShipment(shipment: any): Promise<ShipmentUpdate | null> {
    try {
      const shippingLine = shipment.shipping_line as ShippingLine
      const containerNumber = shipment.container_number
      const bookingReference = shipment.booking_reference

      if (!containerNumber && !bookingReference) {
        console.error("Shipment has no container number or booking reference:", shipment.id)
        return null
      }

      // Get credentials and API client
      const credentials = shippingApiFactory.getCredentials(shippingLine)
      const apiClient = shippingApiFactory.getApiClient(shippingLine, credentials)

      // Get status from API
      let status
      if (containerNumber) {
        status = await apiClient.getContainerStatus(containerNumber)
      } else {
        status = await apiClient.getBookingStatus(bookingReference)
      }

      // Create update record
      const update: ShipmentUpdate = {
        id: uuidv4(),
        shipmentId: shipment.id,
        containerNumber: status.containerNumber,
        bookingReference: bookingReference,
        shippingLine,
        status: status.status,
        previousStatus: shipment.status,
        location: status.location,
        timestamp: status.timestamp,
        eta: status.eta,
        vessel: status.vessel,
        voyage: status.voyage,
        details: status.details,
        source: "api",
        raw: JSON.stringify(status.raw),
        createdAt: new Date().toISOString(),
      }

      // Save the update to the database
      const { error: updateError } = await supabase.from("shipment_updates").insert(update)

      if (updateError) {
        throw updateError
      }

      // Update the shipment with new status
      const nextUpdateTime = this.calculateNextUpdateTime(shippingLine, status.status)

      const { error: shipmentError } = await supabase
        .from("shipments")
        .update({
          status: status.status,
          location: status.location,
          last_updated: new Date().toISOString(),
          next_update_time: nextUpdateTime.toISOString(),
          eta: status.eta,
          vessel: status.vessel,
          voyage: status.voyage,
        })
        .eq("id", shipment.id)

      if (shipmentError) {
        throw shipmentError
      }

      return update
    } catch (error) {
      console.error(`Error updating shipment ${shipment.id}:`, error)

      // Update next_update_time even on failure to prevent constant retries
      await supabase
        .from("shipments")
        .update({
          next_update_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Try again in 30 minutes
          last_error: JSON.stringify(error),
        })
        .eq("id", shipment.id)

      return null
    }
  }

  // Calculate when to next check for updates based on shipping line and status
  private calculateNextUpdateTime(shippingLine: ShippingLine, status: string): Date {
    // Get update config
    const config = this.getUpdateConfig(shippingLine)

    // Base interval in minutes
    let intervalMinutes = config.intervalMinutes

    // Adjust interval based on status
    // Check more frequently for in-transit shipments
    if (status === "in-transit") {
      intervalMinutes = Math.max(30, intervalMinutes / 2)
    }
    // Check less frequently for delivered shipments
    else if (status === "delivered") {
      intervalMinutes = Math.min(1440, intervalMinutes * 4) // Max once per day
    }

    return new Date(Date.now() + intervalMinutes * 60 * 1000)
  }

  // Get update configuration for a shipping line
  private getUpdateConfig(shippingLine: ShippingLine): UpdateConfig {
    // In a real implementation, these would come from a database or configuration file
    const configs: Record<ShippingLine, UpdateConfig> = {
      maersk: {
        shippingLine: "maersk",
        intervalMinutes: 120, // Check every 2 hours
        priority: 1,
        enabled: true,
      },
      msc: {
        shippingLine: "msc",
        intervalMinutes: 180, // Check every 3 hours
        priority: 2,
        enabled: true,
      },
      "cma-cgm": {
        shippingLine: "cma-cgm",
        intervalMinutes: 240, // Check every 4 hours
        priority: 3,
        enabled: false, // Not implemented yet
      },
      "hapag-lloyd": {
        shippingLine: "hapag-lloyd",
        intervalMinutes: 240,
        priority: 3,
        enabled: false,
      },
      one: {
        shippingLine: "one",
        intervalMinutes: 240,
        priority: 4,
        enabled: false,
      },
      evergreen: {
        shippingLine: "evergreen",
        intervalMinutes: 240,
        priority: 4,
        enabled: false,
      },
      cosco: {
        shippingLine: "cosco",
        intervalMinutes: 240,
        priority: 4,
        enabled: false,
      },
      other: {
        shippingLine: "other",
        intervalMinutes: 360, // Check every 6 hours
        priority: 5,
        enabled: false,
      },
    }

    return configs[shippingLine] || configs.other
  }

  // Get shipment updates by tracking number and carrier
  async getShipmentUpdates(trackingNumber: string, carrier: string) {
    const api = shippingApiFactory.getApi(carrier)
    if (!api) {
      throw new Error(`No API found for carrier: ${carrier}`)
    }
    return api.trackShipment(trackingNumber)
  }
}

export const shippingUpdateService = new ShippingUpdateService()
