import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerClient()
    
    // Process TrackShip webhook data
    const { tracking_number, status, location, timestamp, carrier } = body
    
    if (!tracking_number || !status) {
      return NextResponse.json(
        { success: false, error: 'Invalid TrackShip webhook data' },
        { status: 400 }
      )
    }
    
    const { data: update, error } = await supabase
      .from('shipment_updates')
      .insert({
        tracking_number,
        status,
        location,
        timestamp: timestamp || new Date().toISOString(),
        source: 'trackship',
        carrier
      })
      .select()
      .single()

    if (error) {
      console.error('Error processing TrackShip webhook:', error)
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
    console.error('Error processing TrackShip webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
