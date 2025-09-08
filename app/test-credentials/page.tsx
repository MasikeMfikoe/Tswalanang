"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"

export default function TestCredentialsPage() {
  const [showCredentials, setShowCredentials] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return url.includes("supabase.co")
    } catch {
      return false
    }
  }

  const isValidKey = (key: string) => {
    return key.length > 50 && key.startsWith("eyJ")
  }

  const maskCredential = (credential: string) => {
    if (!credential) return "Not found"
    if (credential.length < 20) return credential
    return credential.substring(0, 10) + "..." + credential.substring(credential.length - 10)
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Credentials Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">Supabase URL</div>
                <div className="text-sm text-gray-600">
                  {showCredentials ? supabaseUrl || "Not found" : maskCredential(supabaseUrl)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isValidUrl(supabaseUrl) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">Supabase Anon Key</div>
                <div className="text-sm text-gray-600">
                  {showCredentials ? supabaseAnonKey || "Not found" : maskCredential(supabaseAnonKey)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isValidKey(supabaseAnonKey) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <Button variant="outline" onClick={() => setShowCredentials(!showCredentials)} className="w-full">
              {showCredentials ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Credentials
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Credentials
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-medium mb-2">Environment Variables Status</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
              <div>
                • NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
              </div>
              <div>• SUPABASE_URL: {process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
              <div>• SUPABASE_ANON_KEY: {process.env.SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</div>
            </div>
          </div>

          {(!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium mb-2">Credential Issues Detected</div>
              <div className="text-sm text-red-700 space-y-2">
                {!isValidUrl(supabaseUrl) && (
                  <div>• Supabase URL is missing or invalid. It should look like: https://your-project.supabase.co</div>
                )}
                {!isValidKey(supabaseAnonKey) && (
                  <div>
                    • Supabase Anon Key is missing or invalid. It should be a long JWT token starting with 'eyJ'
                  </div>
                )}
                <div className="mt-2 font-medium">
                  In v0, these are managed automatically. If they're missing, there might be a configuration issue.
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> In v0, environment variables are managed automatically. If your credentials are
            invalid, the issue might be with your Supabase project configuration or the integration setup.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
