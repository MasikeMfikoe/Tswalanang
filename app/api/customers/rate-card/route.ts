import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    const { data: rates, error } = await supabase
      .from('customer_rate_cards')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rate card' },
        { status: 500 }
      )
    }

    return NextResponse.json(rates || [])
  } catch (error) {
    console.error('Error fetching rate card:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, rates } = body

    if (!customerId || !Array.isArray(rates)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Delete existing rates for this customer
    await supabase
      .from('customer_rate_cards')
      .delete()
      .eq('customer_id', customerId)

    // Insert new rates
    const ratesWithCustomerId = rates.map(rate => ({
      ...rate,
      customer_id: customerId,
      created_at: new Date().toISOString()
    }))

    const { data: newRates, error } = await supabase
      .from('customer_rate_cards')
      .insert(ratesWithCustomerId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save rate card' },
        { status: 500 }
      )
    }

    return NextResponse.json(newRates)
  } catch (error) {
    console.error('Error saving rate card:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
