"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Filter, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resourceType: string
  resourceId: string
  details: string
}

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "log_001",
    timestamp: "2024-07-19T10:00:00Z",
    user: "admin@example.com",
    action: "CREATE",
    resourceType: "Order",
    resourceId: "ORD001",
    details: "New order ORD001 created by admin.",
  },
  {
    id: "log_002",
    timestamp: "2024-07-19T10:05:30Z",
    user: "john.doe@example.com",
    action: "UPDATE",
    resourceType: "Customer",
    resourceId: "CUST005",
    details: "Customer CUST005 contact info updated.",
  },
  {
    id: "log_003",
    timestamp: "2024-07-19T10:15:00Z",
    user: "system",
    action: "AUTOMATED",
    resourceType: "Tracking",
    resourceId: "TRK98765",
    details: "Tracking status updated for TRK98765 to 'In Transit'.",
  },
  {
    id: "log_004",
    timestamp: "2024-07-19T11:00:00Z",
    user: "admin@example.com",
    action: "DELETE",
    resourceType: "Document",
    resourceId: "DOC123",
    details: "Document DOC123 deleted by admin.",
  },
  {
    id: "log_005",
    timestamp: "2024-07-19T11:30:00Z",
    user: "jane.smith@example.com",
    action: "LOGIN",
    resourceType: "Auth",
    resourceId: "jane.smith@example.com",
    details: "User jane.smith@example.com logged in successfully.",
  },
  {
    id: "log_006",
    timestamp: "2024-07-19T12:00:00Z",
    user: "admin@example.com",
    action: "UPDATE",
    resourceType: "User Group",
    resourceId: "GRP002",
    details: "Permissions for 'Sales Team' group updated.",
  },
]

export function AuditTrailContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterUser, setFilterUser] = useState("all")
  const [filterAction, setFilterAction] = useState("all")
  const [filterResourceType, setFilterResourceType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAuditLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      // In a real application, you would fetch logs from your backend API
      // For now, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500))
      let filteredLogs = mockAuditLogs

      if (filterUser !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.user.toLowerCase().includes(filterUser.toLowerCase()))
      }
      if (filterAction !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.action.toLowerCase() === filterAction.toLowerCase())
      }
      if (filterResourceType !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.resourceType.toLowerCase() === filterResourceType.toLowerCase())
      }
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase()
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.user.toLowerCase().includes(lowerCaseQuery) ||
            log.action.toLowerCase().includes(lowerCaseQuery) ||
            log.resourceType.toLowerCase().includes(lowerCaseQuery) ||
            log.resourceId.toLowerCase().includes(lowerCaseQuery) ||
            log.details.toLowerCase().includes(lowerCaseQuery),
        )
      }

      setLogs(filteredLogs)
    } catch (err) {
      setError("Failed to fetch audit logs.")
      console.error("Error fetching audit logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [filterUser, filterAction, filterResourceType, searchQuery])

  const uniqueUsers = Array.from(new Set(mockAuditLogs.map((log) => log.user)))
  const uniqueActions = Array.from(new Set(mockAuditLogs.map((log) => log.action)))
  const uniqueResourceTypes = Array.from(new Set(mockAuditLogs.map((log) => log.resourceType)))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by user, ID, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="col-span-full lg:col-span-2"
          />
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterResourceType} onValueChange={setFilterResourceType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resource Types</SelectItem>
              {uniqueResourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setFilterUser("all")
              setFilterAction("all")
              setFilterResourceType("all")
              setSearchQuery("")
            }}
            variant="outline"
            className="col-span-full md:col-span-1"
          >
            <Filter className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-gray-600">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">
            <p>{error}</p>
            <Button onClick={fetchAuditLogs} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No audit logs found for the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{log.user}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.action}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.resourceType}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm">{log.resourceId}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
