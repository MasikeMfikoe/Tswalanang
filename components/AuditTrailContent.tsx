"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AuditEntry {
  timestamp: string
  action: string
  user: string
  details: string
}

export default function AuditTrailContent() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])

  useEffect(() => {
    // In a real application, fetch audit entries from a database or API
    const mockAuditEntries: AuditEntry[] = [
      { timestamp: "2023-10-26T10:00:00Z", action: "Order Created", user: "admin", details: "Order PO001 created" },
      {
        timestamp: "2023-10-26T10:30:00Z",
        action: "Document Uploaded",
        user: "employee",
        details: "Invoice uploaded for PO001",
      },
      {
        timestamp: "2023-10-26T11:00:00Z",
        action: "Order Updated",
        user: "manager",
        details: "Order PO001 status changed to In Progress",
      },
    ]
    setAuditEntries(mockAuditEntries)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Trail</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditEntries.map((entry) => (
            <TableRow key={entry.timestamp}>
              <TableCell>{entry.timestamp}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.user}</TableCell>
              <TableCell>{entry.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
