import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    
    const { trackingNumber, status, location, timestamp, notes } = body
    
    if (!trackingNumber || !status) {
      return NextResponse.json(
        { success: false, error: 'Tracking number and status are required' },
        { status: 400 }
      )
    }
    
    const { data: update, error } = await supabase
      .from('shipment_updates')
      .insert({
        tracking_number: trackingNumber,
        status,
        location,
        timestamp: timestamp || new Date().toISOString(),
        notes,
        source: 'manual'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: update
    })

  } catch (error) {
    console.error('Error creating manual update:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
