import { NextRequest, NextResponse } from 'next/server'
import syncManager from '@/lib/services/data-sync-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Queue the sync operation
    await syncManager.queueSync(body)

    // Get queue status
    const queueStatus = syncManager.getQueueStatus()

    return NextResponse.json({
      success: true,
      message: 'Sync operation queued successfully',
      queueStatus
    })

  } catch (error) {
    console.error('Data sync API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to queue sync operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const queueStatus = syncManager.getQueueStatus()
    
    return NextResponse.json({
      success: true,
      queueStatus
    })

  } catch (error) {
    console.error('Data sync status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
