'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Search, Package, Truck, Ship, Plane } from 'lucide-react'

const ShipmentTrackerPage = () => {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingResults, setTrackingResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setTrackingResults(data)
      } else {
        console.error('Failed to track shipment')
        setTrackingResults({ error: 'Failed to track shipment' })
      }
    } catch (error) {
      console.error('Error tracking shipment:', error)
      setTrackingResults({ error: 'Error tracking shipment' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in_transit':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <Package className="h-4 w-4" />
      case 'shipped':
        return <Ship className="h-4 w-4" />
      case 'air_transport':
        return <Plane className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shipment Tracker</h1>
          <div></div> {/* Spacer for centering */}
        </div>

        {/* Tracking Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Your Shipment
            </CardTitle>
            <CardDescription>
              Enter your tracking number to get real-time updates on your shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                className="flex-1"
              />
              <Button onClick={handleTrack} disabled={isLoading || !trackingNumber.trim()}>
                {isLoading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingResults && (
          <Card>
            <CardHeader>
              <CardTitle>Tracking Results</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingResults.error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{trackingResults.error}</p>
                  <p className="text-gray-500">Please check your tracking number and try again.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Shipment Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getStatusIcon(trackingResults.status)}
                      </div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(trackingResults.status)}>
                        {trackingResults.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Origin</p>
                      <p className="font-medium">{trackingResults.origin || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium">{trackingResults.destination || 'N/A'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Tracking History */}
                  {trackingResults.events && trackingResults.events.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tracking History</h3>
                      <div className="space-y-4">
                        {trackingResults.events.map((event, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {getStatusIcon(event.status)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{event.description}</p>
                              <p className="text-sm text-gray-600">{event.location}</p>
                              <p className="text-xs text-gray-500">{event.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {trackingResults.details && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Shipment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(trackingResults.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ShipmentTrackerPage
