"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  entityType: string
  entityId: string
  details: string
  status: "success" | "failure" | "info" | "warning"
}

export function AuditTrailContent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      // In a real application, you would fetch from your backend API
      // For now, using mock data
      const mockLogs: AuditLog[] = [
        {
          id: "log1",
          timestamp: "2024-07-20T14:30:00Z",
          user: "admin@example.com",
          action: "User Login",
          entityType: "User",
          entityId: "user123",
          details: "Successful login from IP: 192.168.1.1",
          status: "success",
        },
        {
          id: "log2",
          timestamp: "2024-07-20T14:25:00Z",
          user: "ops@example.com",
          action: "Order Status Update",
          entityType: "Order",
          entityId: "ORD001",
          details: "Status changed from 'Pending' to 'In Transit'",
          status: "info",
        },
        {
          id: "log3",
          timestamp: "2024-07-20T14:20:00Z",
          user: "finance@example.com",
          action: "View Financial Report",
          entityType: "Report",
          entityId: "FIN005",
          details: "Accessed Q2 2024 Revenue Report",
          status: "success",
        },
        {
          id: "log4",
          timestamp: "2024-07-20T14:10:00Z",
          user: "admin@example.com",
          action: "User Creation",
          entityType: "User",
          entityId: "user124",
          details: "New user 'Jane Doe' created",
          status: "success",
        },
        {
          id: "log5",
          timestamp: "2024-07-20T14:05:00Z",
          user: "ops@example.com",
          action: "Document Upload",
          entityType: "Document",
          entityId: "DOC007",
          details: "Uploaded Bill of Lading for ORD002",
          status: "success",
        },
        {
          id: "log6",
          timestamp: "2024-07-20T13:50:00Z",
          user: "admin@example.com",
          action: "API Key Generation",
          entityType: "API Key",
          entityId: "key_abc",
          details: "Generated new API key for GoComet integration",
          status: "success",
        },
        {
          id: "log7",
          timestamp: "2024-07-20T13:45:00Z",
          user: "unknown",
          action: "Failed Login Attempt",
          entityType: "User",
          entityId: "user123",
          details: "Incorrect password for user 'user123' from IP: 203.0.113.45",
          status: "failure",
        },
      ]
      setLogs(mockLogs)
    } catch (error: any) {
      console.error("Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load audit logs.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || log.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading audit logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                No audit logs found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  {log.entityType} ({log.entityId})
                </TableCell>
                <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "success"
                        : log.status === "failure"
                          ? "destructive"
                          : log.status === "warning"
                            ? "outline" // Using outline for warning, you might want a custom yellow
                            : "secondary"
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
