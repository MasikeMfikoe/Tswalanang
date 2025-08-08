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
      description,
      orderId 
    } = body

    if (!trackingNumber || !status) {
      return NextResponse.json(
        { error: 'Tracking number and status are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Create shipping update record
    const { data: update, error: updateError } = await supabase
      .from('shipping_updates')
      .insert({
        tracking_number: trackingNumber,
        status,
        location,
        timestamp: timestamp || new Date().toISOString(),
        description,
        order_id: orderId,
        source: 'manual',
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

    // Update order status if orderId is provided
    if (orderId) {
      await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return NextResponse.json(update)
  } catch (error) {
    console.error('Error creating manual shipping update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
