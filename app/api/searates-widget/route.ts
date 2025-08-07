import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const containerNumber = searchParams.get('container')
  
  if (!containerNumber) {
    return NextResponse.json({ error: 'Container number is required' }, { status: 400 })
  }

  // Get the SeaRates API key from server environment
  const apiKey = process.env.SEARATES_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ error: 'SeaRates API key not configured' }, { status: 500 })
  }

  try {
    // Construct the SeaRates widget URL with the API key
    const searatesWidgetUrl = `https://www.searates.com/container-tracking/widget/?number=${encodeURIComponent(containerNumber)}&width=100%&height=500px&api_key=${apiKey}`
    
    return NextResponse.json({ 
      widgetUrl: searatesWidgetUrl,
      containerNumber 
    })
  } catch (error) {
    console.error('Error generating SeaRates widget URL:', error)
    return NextResponse.json({ error: 'Failed to generate widget URL' }, { status: 500 })
  }
}
