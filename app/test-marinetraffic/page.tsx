"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VesselTracker } from "@/components/VesselTracker"
import { Badge } from "@/components/ui/badge"
import { Ship, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestMarineTrafficPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  const runConnectivityTest = async () => {
    setIsRunningTests(true)
    const results = []

    // Test 1: API Key Configuration
    try {
      const response = await fetch("/api/marinetraffic/vessel?name=test")
      const result = await response.json()

      results.push({
        test: "API Key Configuration",
        success: !result.error?.includes("API key not configured"),
        message: result.error?.includes("API key not configured")
          ? "MarineTraffic API key not configured"
          : "API key is configured",
      })
    } catch (error) {
      results.push({
        test: "API Key Configuration",
        success: false,
        message: "Failed to test API configuration",
      })
    }

    // Test 2: Vessel Search by Name
    try {
      const response = await fetch("/api/marinetraffic/vessel?name=MAERSK%20ESSEX&includePorts=true")
      const result = await response.json()

      results.push({
        test: "Vessel Search by Name",
        success: result.success,
        message: result.success ? "Successfully found vessel data" : result.error || "Failed to find vessel",
        data: result.data,
      })
    } catch (error) {
      results.push({
        test: "Vessel Search by Name",
        success: false,
        message: "API request failed",
      })
    }

    // Test 3: Vessel Search by IMO
    try {
      const response = await fetch("/api/marinetraffic/vessel?imo=9074729&includePorts=true")
      const result = await response.json()

      results.push({
        test: "Vessel Search by IMO",
        success: result.success,
        message: result.success ? "Successfully found vessel data" : result.error || "Failed to find vessel",
        data: result.data,
      })
    } catch (error) {
      results.push({
        test: "Vessel Search by IMO",
        success: false,
        message: "API request failed",
      })
    }

    // Test 4: Area Search
    try {
      const response = await fetch("/api/marinetraffic/area?minLat=35&maxLat=36&minLon=23&maxLon=24")
      const result = await response.json()

      results.push({
        test: "Area Search",
        success: result.success,
        message: result.success
          ? `Found ${result.vessels?.length || 0} vessels in area`
          : result.error || "Failed to search area",
      })
    } catch (error) {
      results.push({
        test: "Area Search",
        success: false,
        message: "API request failed",
      })
    }

    setTestResults(results)
    setIsRunningTests(false)
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">MarineTraffic Integration Test</h1>
        <p className="text-gray-600">Test the MarineTraffic API integration and vessel tracking functionality.</p>
      </div>

      {/* API Configuration Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> Make sure to add your MarineTraffic API key to the environment variables:
          <br />
          <code className="bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
            MARINETRAFFIC_API_KEY=your_api_key_here
          </code>
          <br />
          <code className="bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
            MARINETRAFFIC_API_URL=https://services.marinetraffic.com/api
          </code>
        </AlertDescription>
      </Alert>

      {/* Connectivity Tests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            API Connectivity Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runConnectivityTest} disabled={isRunningTests} className="mb-4">
            {isRunningTests ? "Running Tests..." : "Run Connectivity Tests"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <div>
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "PASS" : "FAIL"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Vessel Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Vessel Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <VesselTracker
            onVesselFound={(vessel) => {
              console.log("Vessel tracking data:", vessel)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
