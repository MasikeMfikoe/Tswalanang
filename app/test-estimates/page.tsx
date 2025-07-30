"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEstimatesPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectSupabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-estimates-connection")
      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      setTestResults({ error: "Failed to test connection", details: error })
    } finally {
      setLoading(false)
    }
  }

  const testAPIRoute = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/estimates")
      const result = await response.json()
      setTestResults({ apiTest: true, response: result })
    } catch (error) {
      setTestResults({ apiTest: true, error: "API call failed", details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Estimates Connection</h1>
        <p className="text-muted-foreground">Debug the estimates data connection</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Connection Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDirectSupabase} disabled={loading}>
              Test Direct Supabase Connection
            </Button>
            <Button onClick={testAPIRoute} disabled={loading}>
              Test API Route
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
