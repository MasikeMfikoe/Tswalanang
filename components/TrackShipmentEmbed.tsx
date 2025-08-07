'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Search } from 'lucide-react'

interface TrackShipmentEmbedProps {
  initialTrackingNumber?: string
}

export default function TrackShipmentEmbed({ initialTrackingNumber = '' }: TrackShipmentEmbedProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber)
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/searates-widget?trackingNumber=${encodeURIComponent(trackingNumber)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tracking widget')
      }

      setWidgetUrl(data.widgetUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setWidgetUrl(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialTrackingNumber) {
      handleTrack()
    }
  }, [initialTrackingNumber])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Track Your Shipment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="tracking-number">Tracking Number</Label>
            <Input
              id="tracking-number"
              type="text"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleTrack} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tracking...
                </>
              ) : (
                'Track'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {widgetUrl && (
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={widgetUrl}
              width="100%"
              height="600"
              frameBorder="0"
              title="SeaRates Tracking Widget"
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
