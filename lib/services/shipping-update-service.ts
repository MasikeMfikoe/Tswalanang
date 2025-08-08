import { createServerClient } from '@/lib/supabaseClient'

export interface ShippingUpdate {
  tracking_number: string
  status: string
  location?: string
  timestamp: string
  source: string
  carrier?: string
  notes?: string
}

export class ShippingUpdateService {
  private supabase = createServerClient()

  async createUpdate(update: ShippingUpdate) {
    const { data, error } = await this.supabase
      .from('shipment_updates')
      .insert(update)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create shipping update: ${error.message}`)
    }

    return data
  }

  async getUpdatesForTracking(trackingNumber: string) {
    const { data, error } = await this.supabase
      .from('shipment_updates')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch updates: ${error.message}`)
    }

    return data
  }

  async getLatestUpdate(trackingNumber: string) {
    const { data, error } = await this.supabase
      .from('shipment_updates')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch latest update: ${error.message}`)
    }

    return data
  }

  async updateStatus(trackingNumber: string, status: string, location?: string, notes?: string) {
    const update: ShippingUpdate = {
      tracking_number: trackingNumber,
      status,
      location,
      timestamp: new Date().toISOString(),
      source: 'manual',
      notes
    }

    return this.createUpdate(update)
  }
}

export const shippingUpdateService = new ShippingUpdateService()
