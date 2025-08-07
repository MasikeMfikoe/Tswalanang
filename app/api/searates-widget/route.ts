import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')
    
    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.SEARATES_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SeaRates API key not configured' },
        { status: 500 }
      )
    }

    // Construct the SeaRates widget URL with the API key
    const widgetUrl = `https://www.searates.com/services/tracking/?number=${encodeURIComponent(trackingNumber)}&api_key=${apiKey}`

    return NextResponse.json({ widgetUrl })
  } catch (error) {
    console.error('SeaRates widget error:', error)
    return NextResponse.json(
      { error: 'Failed to generate widget URL' },
      { status: 500 }
    )
  }
}
