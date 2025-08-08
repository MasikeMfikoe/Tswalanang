'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search, Ship, Package, MapPin, Clock } from 'lucide-react'

export default function ShipmentTrackerPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    try {
      // Navigate to results page with tracking number
      router.push(`/shipment-tracker/results/${encodeURIComponent(trackingNumber)}`)
    } catch (error) {
      console.error('Error tracking shipment:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Shipment Tracker</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Ship className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Shipment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your tracking number below to get real-time updates on your shipment's location and status.
          </p>
        </div>

        {/* Tracking Input */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Tracking Information
            </CardTitle>
            <CardDescription>
              Enter your container number, bill of lading, or booking reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="e.g., MSKU1234567, BL123456789, or BOOK789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-lg py-6"
              />
              <Button
                onClick={handleTrack}
                disabled={!trackingNumber.trim() || isLoading}
                className="px-8 py-6 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tracking...
                  </div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Real-time Location</h3>
              </div>
              <p className="text-gray-600">
                Get precise location updates of your shipment as it moves through the supply chain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Status Updates</h3>
              </div>
              <p className="text-gray-600">
                Receive detailed status information including customs clearance and delivery updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Estimated Delivery</h3>
              </div>
              <p className="text-gray-600">
                Get accurate estimated arrival times and delivery schedules for your shipments.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Tracking Number Formats</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Container: MSKU1234567 (4 letters + 7 digits)</li>
                  <li>• Bill of Lading: BL123456789</li>
                  <li>• Booking Reference: BOOK789123</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Having Issues?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  If you're having trouble tracking your shipment, please contact our support team.
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
