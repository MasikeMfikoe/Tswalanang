import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await params
    const { data, error } = await supabase
      .from('courier_order_notifications')
      .select('*')
      .eq('order_id', id)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Unhandled error in GET /api/courier-orders/[id]/notifications:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
