"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SyncStatus {
  mockUsers: number
  supabaseProfiles: number
  supabaseAuthUsers: number
  needsSync: boolean
  profiles: any[]
}

interface SyncResult {
  email: string
  status: "success" | "error"
  error?: string
  authUserId?: string
  profile?: any
}

export default function SyncUsersPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])
  const { toast } = useToast()

  useEffect(() => {
    checkSyncStatus()
  }, [])

  const checkSyncStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/sync-mock-data")
      const data = await response.json()

      if (data.success) {
        setSyncStatus(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to check sync status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking sync status:", error)
      toast({
        title: "Error",
        description: "Failed to check sync status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncMockData = async () => {
    setIsSyncing(true)
    setSyncResults([])

    try {
      const response = await fetch("/api/sync-mock-data", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setSyncResults(data.results)
        toast({
          title: "Success",
          description: data.message,
        })
        // Refresh status after sync
        setTimeout(() => {
          checkSyncStatus()
        }, 1000)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to sync mock data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error syncing mock data:", error)
      toast({
        title: "Error",
        description: "Failed to sync mock data",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Data Sync</h1>
          <p className="text-muted-foreground">Sync mock user data with Supabase Auth and user_profiles tables</p>
        </div>
        <Button onClick={checkSyncStatus} disabled={isLoading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sync Status
          </CardTitle>
          <CardDescription>Current state of user data synchronization</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : syncStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{syncStatus.mockUsers}</div>
                  <div className="text-sm text-muted-foreground">Mock Users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{syncStatus.supabaseProfiles}</div>
                  <div className="text-sm text-muted-foreground">User Profiles</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{syncStatus.supabaseAuthUsers}</div>
                  <div className="text-sm text-muted-foreground">Auth Users</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {syncStatus.needsSync ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-medium">{syncStatus.needsSync ? "Sync Required" : "Data Synchronized"}</span>
                </div>
                <Button onClick={syncMockData} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Sync Mock Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load sync status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
            <CardDescription>Results from the last synchronization operation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.status === "success" ? "default" : "destructive"}>{result.status}</Badge>
                    {result.error && (
                      <span className="text-sm text-red-500 max-w-xs truncate" title={result.error}>
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Users in Supabase */}
      {syncStatus?.profiles && syncStatus.profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Users in Supabase</CardTitle>
            <CardDescription>Users currently stored in the user_profiles table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncStatus.profiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{`${profile.name} ${profile.surname}`}</div>
                      <div className="text-sm text-muted-foreground">{profile.email}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
