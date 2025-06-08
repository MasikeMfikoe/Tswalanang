"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InternalUsersTab } from "./components/internal-users-tab"
import { ClientUsersTab } from "./components/client-users-tab"
import { PageHeader } from "@/components/ui/page-header"

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("internal")
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setIsLoading(true)
    setTestResult("🔍 Testing Supabase connection...")

    try {
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("Environment check:")
      console.log("URL:", supabaseUrl ? "Set" : "Missing")
      console.log("Key:", supabaseKey ? "Set" : "Missing")

      if (!supabaseUrl || !supabaseKey) {
        setTestResult(`❌ Environment variables missing:
URL: ${supabaseUrl ? "✅" : "❌"}
Key: ${supabaseKey ? "✅" : "❌"}

Please check your environment variables.`)
        return
      }

      // Test basic fetch to Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=count`, {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        setTestResult(`❌ Connection failed:
Status: ${response.status}
URL: ${supabaseUrl}

Common issues:
- Invalid URL or API key
- Project paused/deleted
- Table doesn't exist`)
        return
      }

      setTestResult(`✅ SUCCESS!
Status: ${response.status}
URL: ${supabaseUrl}

Supabase connection is working!`)
    } catch (error: any) {
      console.error("Error:", error)
      setTestResult(`❌ Error: ${error.message}

This could be:
- Network connectivity issue
- Invalid Supabase configuration
- CORS or security issue`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="User Management" description="Manage internal organization users and external client users" />

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">🔧 Supabase Connection Test</CardTitle>
          <CardDescription>Simple test to check Supabase connectivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testSupabaseConnection}
            disabled={isLoading}
            variant="outline"
            className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
          >
            {isLoading ? "Testing..." : "🔧 Test Connection"}
          </Button>

          {testResult && (
            <div
              className={`p-4 rounded-md text-sm whitespace-pre-line ${
                testResult.includes("SUCCESS")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {testResult}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="internal" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="internal">Users</TabsTrigger>
          <TabsTrigger value="client">Client Users</TabsTrigger>
        </TabsList>
        <TabsContent value="internal" className="mt-6">
          <InternalUsersTab />
        </TabsContent>
        <TabsContent value="client" className="mt-6">
          <ClientUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
