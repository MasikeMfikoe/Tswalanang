"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton" // Assuming you have a Skeleton component

interface AuditEntry {
  id: string
  timestamp: string
  user_email: string
  action: string
  module: string | null
  record_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
}

export default function AuditTrailContent() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10) // Number of items per page
  const [totalPages, setTotalPages] = useState(1)

  const fetchAuditEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/audit-trail?page=${page}&pageSize=${pageSize}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch audit entries")
      }
      const result = await response.json()
      setAuditEntries(result.data)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching audit entries:", err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchAuditEntries()
  }, [fetchAuditEntries])

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 sr-only">Audit Trail</h1> {/* sr-only as it's already in page.tsx */}
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEntries.length > 0 ? (
                auditEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{entry.user_email}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>{entry.module || "N/A"}</TableCell>
                    <TableCell>{entry.record_id || "N/A"}</TableCell>
                    <TableCell>{entry.details ? JSON.stringify(entry.details, null, 2) : "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No audit entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end items-center gap-4 mt-4">
            <Button variant="outline" onClick={handlePreviousPage} disabled={page === 1 || loading}>
              <ChevronLeftIcon className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" onClick={handleNextPage} disabled={page === totalPages || loading}>
              Next <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
