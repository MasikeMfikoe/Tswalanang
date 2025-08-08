import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    
    // Process webhook data based on the provider
    const { provider, trackingNumber, status, location, timestamp } = body
    
    if (!trackingNumber || !status) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook data' },
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
        source: provider || 'webhook'
      })
      .select()
      .single()

    if (error) {
      console.error('Error processing webhook:', error)
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
    console.error('Error processing shipping webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
