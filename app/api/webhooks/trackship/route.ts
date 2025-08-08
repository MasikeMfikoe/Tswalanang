import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tracking_number,
      status,
      substatus,
      location,
      timestamp,
      carrier,
      description,
      checkpoints 
    } = body

    if (!tracking_number || !status) {
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
      .eq('tracking_number', tracking_number)
      .single()

    // Create shipping update record
    const { data: update, error: updateError } = await supabase
      .from('shipping_updates')
      .insert({
        tracking_number,
        status,
        substatus,
        location,
        timestamp: timestamp || new Date().toISOString(),
        carrier,
        description,
        checkpoints: checkpoints ? JSON.stringify(checkpoints) : null,
        order_id: order?.id,
        source: 'trackship',
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

    // Process checkpoints if provided
    if (checkpoints && Array.isArray(checkpoints)) {
      const checkpointInserts = checkpoints.map(checkpoint => ({
        tracking_number,
        status: checkpoint.status,
        location: checkpoint.location,
        timestamp: checkpoint.timestamp,
        description: checkpoint.description,
        order_id: order?.id,
        source: 'trackship_checkpoint',
        created_at: new Date().toISOString()
      }))

      await supabase
        .from('shipping_updates')
        .insert(checkpointInserts)
    }

    return NextResponse.json({ 
      success: true, 
      updateId: update.id,
      orderUpdated: !!order,
      checkpointsProcessed: checkpoints?.length || 0
    })
  } catch (error) {
    console.error('Error processing TrackShip webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
