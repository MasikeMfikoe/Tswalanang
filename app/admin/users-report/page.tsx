"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Users, Shield, Database } from "lucide-react"

interface UserPermission {
  username: string
  email: string
  displayName: string
  role: string
  department: string
  roleBasedPermissions: Array<{
    page: string
    permissions: Record<string, boolean>
  }>
  databasePageAccess: string[]
  totalRolePages: number
  totalDatabasePages: number
}

interface PermissionsReport {
  generatedAt: string
  totalUsers: number
  roleStatistics: Record<string, { count: number; users: string[] }>
  users: UserPermission[]
}

export default function UsersReportPage() {
  const [report, setReport] = useState<PermissionsReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users/permissions-report")
      if (!response.ok) {
        throw new Error("Failed to fetch permissions report")
      }
      const data = await response.json()
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `user-permissions-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-yellow-100 text-yellow-800"
      case "employee":
        return "bg-green-100 text-green-800"
      case "client":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading permissions report...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchReport}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Permissions Report</h1>
          <p className="text-gray-600">Generated on {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <Button onClick={downloadReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(report.roleStatistics).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pages/User</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(report.users.reduce((acc, user) => acc + user.totalRolePages, 0) / report.totalUsers)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(report.roleStatistics).map(([role, stats]) => (
              <div key={role} className="text-center p-4 border rounded-lg">
                <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
                <p className="text-2xl font-bold mt-2">{stats.count}</p>
                <p className="text-sm text-gray-600">users</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed User List */}
      <Card>
        <CardHeader>
          <CardTitle>User Details & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.users.map((user, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{user.displayName || user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.department}</p>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Role-Based Permissions ({user.totalRolePages} pages)</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {user.roleBasedPermissions.map((perm, idx) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>{perm.page}</span>
                          <span className="text-gray-500">
                            {Object.entries(perm.permissions)
                              .filter(([_, allowed]) => allowed)
                              .map(([action]) => action)
                              .join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Database Page Access ({user.totalDatabasePages} pages)</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {user.databasePageAccess.length > 0 ? (
                        user.databasePageAccess.map((page, idx) => (
                          <div key={idx} className="text-sm">
                            {page}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No database page access configured</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
