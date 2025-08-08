import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      trackingNumber, 
      status, 
      location, 
      timestamp, 
      carrier,
      description 
    } = body

    if (!trackingNumber || !status) {
      return NextResponse.json(
        { error: 'Tracking number and status are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Find the order associated with this tracking number
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('tracking_number', trackingNumber)
      .single()

    // Create shipping update record
    const { data: update, error: updateError } = await supabase
      .from('shipping_updates')
      .insert({
        tracking_number: trackingNumber,
        status,
        location,
        timestamp: timestamp || new Date().toISOString(),
        carrier,
        description,
        order_id: order?.id,
        source: 'webhook',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to create shipping update' },
        { status: 500 }
      )
    }

    // Update order status if order was found
    if (order) {
      await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
    }

    return NextResponse.json({ 
      success: true, 
      updateId: update.id,
      orderUpdated: !!order
    })
  } catch (error) {
    console.error('Error processing shipping webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
