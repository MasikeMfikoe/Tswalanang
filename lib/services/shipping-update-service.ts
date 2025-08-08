import { createServerClient } from '@/lib/supabaseClient'

export interface ShippingUpdate {
  id?: string
  tracking_number: string
  status: string
  substatus?: string
  location?: string
  timestamp: string
  carrier?: string
  description?: string
  checkpoints?: string
  order_id?: string
  source: 'manual' | 'webhook' | 'trackship' | 'trackship_checkpoint'
  created_at?: string
}

export class ShippingUpdateService {
  private supabase = createServerClient()

  async createUpdate(update: Omit<ShippingUpdate, 'id' | 'created_at'>): Promise<ShippingUpdate> {
    const { data, error } = await this.supabase
      .from('shipping_updates')
      .insert({
        ...update,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create shipping update: ${error.message}`)
    }

    return data
  }

  async getUpdatesByTrackingNumber(trackingNumber: string): Promise<ShippingUpdate[]> {
    const { data, error } = await this.supabase
      .from('shipping_updates')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch shipping updates: ${error.message}`)
    }

    return data || []
  }

  async getUpdatesByOrderId(orderId: string): Promise<ShippingUpdate[]> {
    const { data, error } = await this.supabase
      .from('shipping_updates')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch shipping updates: ${error.message}`)
    }

    return data || []
  }

  async getLatestUpdate(trackingNumber: string): Promise<ShippingUpdate | null> {
    const { data, error } = await this.supabase
      .from('shipping_updates')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No records found
      }
      throw new Error(`Failed to fetch latest shipping update: ${error.message}`)
    }

    return data
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }
  }

  async findOrderByTrackingNumber(trackingNumber: string): Promise<{ id: string } | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('id')
      .eq('tracking_number', trackingNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No records found
      }
      throw new Error(`Failed to find order: ${error.message}`)
    }

    return data
  }

  async processWebhookUpdate(webhookData: any, source: string): Promise<ShippingUpdate> {
    const {
      tracking_number,
      trackingNumber,
      status,
      substatus,
      location,
      timestamp,
      carrier,
      description,
      checkpoints
    } = webhookData

    const finalTrackingNumber = tracking_number || trackingNumber

    if (!finalTrackingNumber || !status) {
      throw new Error('Tracking number and status are required')
    }

    // Find associated order
    const order = await this.findOrderByTrackingNumber(finalTrackingNumber)

    // Create the main update
    const update = await this.createUpdate({
      tracking_number: finalTrackingNumber,
      status,
      substatus,
      location,
      timestamp: timestamp || new Date().toISOString(),
      carrier,
      description,
      checkpoints: checkpoints ? JSON.stringify(checkpoints) : undefined,
      order_id: order?.id,
      source: source as any
    })

    // Update order status if order exists
    if (order) {
      await this.updateOrderStatus(order.id, status)
    }

    // Process checkpoints if provided
    if (checkpoints && Array.isArray(checkpoints)) {
      for (const checkpoint of checkpoints) {
        await this.createUpdate({
          tracking_number: finalTrackingNumber,
          status: checkpoint.status,
          location: checkpoint.location,
          timestamp: checkpoint.timestamp,
          description: checkpoint.description,
          order_id: order?.id,
          source: `${source}_checkpoint` as any
        })
      }
    }

    return update
  }
}

export const shippingUpdateService = new ShippingUpdateService()
