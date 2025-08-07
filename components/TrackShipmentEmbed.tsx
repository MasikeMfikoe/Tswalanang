'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'

interface TrackShipmentEmbedProps {
  submittedContainer: string
}

export default function TrackShipmentEmbed({ submittedContainer }: TrackShipmentEmbedProps) {
  const [trackingNumber, setTrackingNumber] = useState(submittedContainer)
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWidgetUrl = async (number: string) => {
    if (!number.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/searates-widget?trackingNumber=${encodeURIComponent(number)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tracking widget')
      }

      setWidgetUrl(data.widgetUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking widget')
      setWidgetUrl(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWidgetUrl(trackingNumber)
  }

  useEffect(() => {
    if (submittedContainer) {
      fetchWidgetUrl(submittedContainer)
    }
  }, [submittedContainer])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Track Your Shipment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter container or tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !trackingNumber.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Track
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {widgetUrl && (
          <div className="border rounded-md overflow-hidden">
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

        {!widgetUrl && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            {submittedContainer ? 'Loading tracking information...' : 'Enter a tracking number to view shipment details'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
