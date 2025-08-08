"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"

export default function DebugEstimatesPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectSupabase = async () => {
    setLoading(true)
    try {
      console.log("Testing direct Supabase connection...")

      // Test 1: Raw query to see table structure
      const { data: rawData, error: rawError } = await supabase.from("estimates").select("*").limit(5)

      console.log("Raw Supabase data:", rawData)
      console.log("Raw Supabase error:", rawError)

      // Test 2: Count total records
      const { count, error: countError } = await supabase.from("estimates").select("*", { count: "exact", head: true })

      console.log("Total count:", count)
      console.log("Count error:", countError)

      // Test 3: Test the API endpoint
      const apiResponse = await fetch("/api/estimates")
      const apiData = await apiResponse.json()

      console.log("API Response:", apiData)

      setResults({
        rawData,
        rawError,
        count,
        countError,
        apiData,
        apiStatus: apiResponse.status,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error("Debug error:", error)
      setResults({ error: error.message, timestamp: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  const testEstimatesApi = async () => {
    setLoading(true)
    try {
      // Test the estimates API function
      const { getEstimates } = await import("@/lib/api/estimatesApi")
      const result = await getEstimates({ page: 1, pageSize: 10 })

      console.log("EstimatesApi result:", result)
      setResults({ estimatesApiResult: result, timestamp: new Date().toISOString() })
    } catch (error: any) {
      console.error("EstimatesApi error:", error)
      setResults({ estimatesApiError: error.message, timestamp: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Estimates Data</h1>
        <p className="text-muted-foreground">Debug estimates table and API connections</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Debug Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDirectSupabase} disabled={loading}>
              Test Direct Supabase + API
            </Button>
            <Button onClick={testEstimatesApi} disabled={loading}>
              Test Estimates API Function
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
