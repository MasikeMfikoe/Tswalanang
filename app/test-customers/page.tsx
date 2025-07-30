"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customersApi } from "@/lib/api/customersApi"
import { createClient } from "@supabase/supabase-js"

export default function TestCustomersPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectSupabase = async () => {
    setLoading(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setResult({ error: "Missing Supabase environment variables" })
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Test if customers table exists
      const { data, error } = await supabase.from("customers").select("*").limit(5)

      setResult({
        success: !error,
        data: data,
        error: error?.message,
        count: data?.length || 0,
      })
    } catch (error) {
      setResult({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const testCustomersAPI = async () => {
    setLoading(true)
    try {
      const response = await customersApi.getCustomers()
      setResult({
        success: true,
        apiResponse: response,
        data: response.data,
        count: response.data?.length || 0,
      })
    } catch (error) {
      setResult({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  const testFetchAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setResult({
        success: response.ok,
        status: response.status,
        data: data,
      })
    } catch (error) {
      setResult({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Customer API Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={testDirectSupabase} disabled={loading}>
          Test Direct Supabase
        </Button>
        <Button onClick={testCustomersAPI} disabled={loading}>
          Test Customers API
        </Button>
        <Button onClick={testFetchAPI} disabled={loading}>
          Test Fetch API
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
