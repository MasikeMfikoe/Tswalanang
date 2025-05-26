"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle } from "lucide-react"
import { supabase, testConnection } from "@/lib/supabase"

export default function DatabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "failed">("testing")
  const [tables, setTables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [envVarsStatus, setEnvVarsStatus] = useState<any>({})

  useEffect(() => {
    checkEnvironmentVariables()
    testDatabaseConnection()
  }, [])

  const checkEnvironmentVariables = () => {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    setEnvVarsStatus({
      url: !!envVars.NEXT_PUBLIC_SUPABASE_URL,
      key: !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: envVars.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      keyValue: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + "...",
    })
  }

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("testing")

    try {
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Database Connection Test</h1>
      </div>

      {/* Environment Variables Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
              {envVarsStatus.url ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                  <span className="text-sm text-gray-500">{envVarsStatus.urlValue}</span>
                </div>
              ) : (
                <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              {envVarsStatus.key ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">✓ Set</Badge>
                  <span className="text-sm text-gray-500">{envVarsStatus.keyValue}</span>
                </div>
              ) : (
                <Badge className="bg-red-100 text-red-800">✗ Missing</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
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

      {/* Tables Status */}
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

      {/* Error Information */}
      {connectionStatus === "failed" && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <h3 className="font-medium mb-2">Connection Failed</h3>
              <p className="text-sm mb-4">Possible issues:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Environment variables not properly set</li>
                <li>Supabase project not accessible</li>
                <li>Database tables not created yet</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {connectionStatus === "connected" && (
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-green-600">
              <h3 className="font-medium mb-2">✅ Connection Successful!</h3>
              <p className="text-sm mb-4">Your app is now connected to Supabase. Next steps:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Test login functionality with demo/demo</li>
                <li>Create your first admin user</li>
                <li>Add sample data to test features</li>
                <li>Configure shipping line integrations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
