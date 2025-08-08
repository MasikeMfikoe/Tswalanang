'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Search, Ship, Package, MapPin, Clock, Truck, Plane } from 'lucide-react'

interface TrackingEvent {
  date: string
  time: string
  location: string
  status: string
  description: string
  type: 'departure' | 'arrival' | 'transit' | 'customs' | 'delivery'
}

interface TrackingResult {
  trackingNumber: string
  status: string
  carrier: string
  service: string
  origin: string
  destination: string
  estimatedDelivery: string
  events: TrackingEvent[]
}

const mockTrackingData: TrackingResult = {
  trackingNumber: 'TSW123456789',
  status: 'In Transit',
  carrier: 'TSW Logistics',
  service: 'Ocean Freight',
  origin: 'Shanghai, China',
  destination: 'Cape Town, South Africa',
  estimatedDelivery: '2024-02-15',
  events: [
    {
      date: '2024-01-20',
      time: '14:30',
      location: 'Shanghai Port, China',
      status: 'Departed',
      description: 'Container departed from origin port',
      type: 'departure'
    },
    {
      date: '2024-01-25',
      time: '09:15',
      location: 'Singapore Port',
      status: 'In Transit',
      description: 'Container in transit through Singapore',
      type: 'transit'
    },
    {
      date: '2024-02-02',
      time: '16:45',
      location: 'Durban Port, South Africa',
      status: 'Arrived',
      description: 'Container arrived at destination country',
      type: 'arrival'
    },
    {
      date: '2024-02-05',
      time: '11:20',
      location: 'Cape Town Customs',
      status: 'Customs Clearance',
      description: 'Container undergoing customs clearance',
      type: 'customs'
    }
  ]
}

const getStatusIcon = (type: string) => {
  switch (type) {
    case 'departure':
      return <Ship className="h-4 w-4" />
    case 'arrival':
      return <MapPin className="h-4 w-4" />
    case 'transit':
      return <Truck className="h-4 w-4" />
    case 'customs':
      return <Package className="h-4 w-4" />
    case 'delivery':
      return <Plane className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'in transit':
      return 'bg-blue-100 text-blue-800'
    case 'departed':
      return 'bg-yellow-100 text-yellow-800'
    case 'arrived':
      return 'bg-purple-100 text-purple-800'
    case 'customs clearance':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ShipmentTrackerPage() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, return mock data
      setTrackingResult(mockTrackingData)
    } catch (err) {
      setError('Failed to track shipment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Ship className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Shipment Tracker</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Your Shipment</CardTitle>
            <CardDescription>
              Enter your tracking number to get real-time updates on your shipment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tracking number (e.g., TSW123456789)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button onClick={handleTrack} disabled={isLoading} className="px-6">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Tracking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Track</span>
                  </div>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {trackingResult && (
          <div className="space-y-6">
            {/* Shipment Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Shipment Details</CardTitle>
                  <Badge className={getStatusColor(trackingResult.status)}>
                    {trackingResult.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                    <p className="text-sm text-gray-900">{trackingResult.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Carrier</p>
                    <p className="text-sm text-gray-900">{trackingResult.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service</p>
                    <p className="text-sm text-gray-900">{trackingResult.service}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Est. Delivery</p>
                    <p className="text-sm text-gray-900">{trackingResult.estimatedDelivery}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Origin</p>
                    <p className="text-sm text-gray-900">{trackingResult.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Destination</p>
                    <p className="text-sm text-gray-900">{trackingResult.destination}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Timeline</CardTitle>
                <CardDescription>
                  Follow your shipment's journey from origin to destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingResult.events.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getStatusIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{event.status}</p>
                          <div className="text-sm text-gray-500">
                            {event.date} at {event.time}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tracking Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tracking numbers are usually 10-15 characters long</li>
                  <li>• Updates may take 24-48 hours to appear</li>
                  <li>• Check for any typos in your tracking number</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Can't find your shipment? Our support team is here to help.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
