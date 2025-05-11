"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"
import { Search, FileText, Truck, Clock } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function TrackingWelcomePage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect to shipment tracker after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/shipment-tracker")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-black text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center space-x-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
              alt="TSW SmartLog Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold">TSW SmartLog Shipment Tracker</h1>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome, {user?.name}!</CardTitle>
              <CardDescription className="text-center">
                You are now logged in to the TSW SmartLog Shipment Tracking Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="mb-2">You will be redirected to the tracking page in a few seconds...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div className="bg-black h-2.5 rounded-full w-1/2 animate-[progress_5s_ease-in-out]"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Search className="h-10 w-10 text-black mb-2" />
                  <h3 className="font-semibold mb-1">Track Shipments</h3>
                  <p className="text-sm text-center text-gray-600">
                    Track your shipments in real-time with detailed status updates
                  </p>
                </div>

                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <FileText className="h-10 w-10 text-black mb-2" />
                  <h3 className="font-semibold mb-1">View Documents</h3>
                  <p className="text-sm text-center text-gray-600">
                    Access shipping documents and delivery information
                  </p>
                </div>

                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Truck className="h-10 w-10 text-black mb-2" />
                  <h3 className="font-semibold mb-1">Delivery Updates</h3>
                  <p className="text-sm text-center text-gray-600">Get the latest updates on your delivery status</p>
                </div>

                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Clock className="h-10 w-10 text-black mb-2" />
                  <h3 className="font-semibold mb-1">ETA Information</h3>
                  <p className="text-sm text-center text-gray-600">View estimated time of arrival for your shipments</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => router.push("/shipment-tracker")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Go to Tracking Page Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} TSW SmartLog. All rights reserved.</p>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
