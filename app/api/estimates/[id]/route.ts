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
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching estimate:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Estimate not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Unhandled error in GET /api/estimates/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await params
    const body = await request.json()
    const { data, error } = await supabase
      .from('estimates')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating estimate:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Unhandled error in PUT /api/estimates/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await params
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting estimate:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Estimate deleted successfully' })
  } catch (error: any) {
    console.error('Unhandled error in DELETE /api/estimates/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
