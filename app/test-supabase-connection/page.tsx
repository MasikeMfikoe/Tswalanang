"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestSupabaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [supabaseUrl, setSupabaseUrl] = useState<string>("")
  const [supabaseKey, setSupabaseKey] = useState<string>("")
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    // Get Supabase URL and key (masked)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 5)}`
      : "Not set"

    setSupabaseUrl(url)
    setSupabaseKey(key)

    // Test connection on load
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus("loading")
    setErrorMessage("")
    setTestResult(null)

    try {
      console.log("Testing Supabase connection...")

      // Simple query to test connection
      const { data, error, count } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

      if (error) {
        console.error("Supabase connection test failed:", error)
        setConnectionStatus("error")
        setErrorMessage(error.message)
        return
      }

      console.log("Supabase connection successful. Table has", count, "rows")
      setConnectionStatus("success")
      setTestResult({
        connectionTest: "Success",
        userCount: count,
        message: `Successfully connected to user_profiles table with ${count} rows`,
      })

      // Try a simple insert
      const testUser = {
        id: crypto.randomUUID(),
        username: `test_${Date.now()}`,
        name: "Test",
        surname: "User",
        email: `test_${Date.now()}@example.com`,
        role: "guest",
        department: "Test Department",
        page_access: ["dashboard"],
      }

      console.log("Testing insert with:", testUser)

      const { data: insertData, error: insertError } = await supabase.from("user_profiles").insert(testUser).select()

      if (insertError) {
        console.error("Insert test failed:", insertError)
        setErrorMessage(`Connection OK but insert failed: ${insertError.message}`)
        return
      }

      console.log("Insert test successful:", insertData)
      setTestResult({
        connectionTest: "Success",
        insertTest: "Success",
        insertedUser: insertData,
      })
    } catch (error) {
      console.error("Error testing connection:", error)
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Supabase URL:</h3>
                <p className="text-sm bg-gray-100 p-2 rounded">{supabaseUrl}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Supabase Anon Key:</h3>
                <p className="text-sm bg-gray-100 p-2 rounded">{supabaseKey}</p>
              </div>
            </div>

            {connectionStatus === "loading" && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Testing connection...</AlertTitle>
                <AlertDescription>Attempting to connect to Supabase and run a test query.</AlertDescription>
              </Alert>
            )}

            {connectionStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Connection successful!</AlertTitle>
                <AlertDescription>Successfully connected to Supabase.</AlertDescription>
              </Alert>
            )}

            {connectionStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>Connection failed!</AlertTitle>
                <AlertDescription>{errorMessage || "Could not connect to Supabase."}</AlertDescription>
              </Alert>
            )}

            {testResult && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Test Results:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

            <Button onClick={testConnection} className="mt-4">
              Test Connection Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
