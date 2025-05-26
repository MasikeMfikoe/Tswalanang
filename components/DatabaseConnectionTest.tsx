"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, RefreshCw } from "lucide-react"
import { supabase, testConnection } from "@/lib/supabase"

export default function DatabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "failed">("testing")
  const [tables, setTables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("testing")

    try {
      // Test basic connection
      const isConnected = await testConnection()

      if (isConnected) {
        setConnectionStatus("connected")
        await checkTables()
      } else {
        setConnectionStatus("failed")
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("failed")
    } finally {
      setIsLoading(false)
    }
  }

  const checkTables = async () => {
    const tablesToCheck = [
      "user_profiles",
      "orders",
      "uploaded_documents",
      "shipments",
      "shipment_updates",
      "cargo_status_history",
    ]

    const tableStatus = []

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        tableStatus.push({
          name: tableName,
          exists: !error,
          error: error?.message || null,
          recordCount: data?.length || 0,
        })
      } catch (err) {
        tableStatus.push({
          name: tableName,
          exists: false,
          error: "Table not accessible",
          recordCount: 0,
        })
      }
    }

    setTables(tableStatus)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge className="bg-green-100 text-green-800">✓ Connected</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus)}
              <span className="font-medium">
                {connectionStatus === "testing" && "Testing connection..."}
                {connectionStatus === "connected" && "Connected to Supabase"}
                {connectionStatus === "failed" && "Connection failed"}
              </span>
            </div>
            <Button onClick={testDatabaseConnection} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Test Again
            </Button>
          </div>
        </CardContent>
      </Card>

      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Database Tables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{table.name}</div>
                    {table.error && <div className="text-sm text-red-600">{table.error}</div>}
                  </div>
                  {getStatusBadge(table.exists)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {connectionStatus === "failed" && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <h3 className="font-medium mb-2">Connection Failed</h3>
              <p className="text-sm mb-4">Make sure your Supabase environment variables are correctly set:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>SUPABASE_URL</li>
                <li>SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
