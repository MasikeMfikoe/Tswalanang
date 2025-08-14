"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getEstimates } from "@/lib/api/estimatesApi"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/lib/toast"
import type { Estimate } from "@/types/models"

export default function EstimatesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [filteredEstimates, setFilteredEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEstimates, setTotalEstimates] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const pageSize = 10

  // Fetch estimates from API
  const fetchEstimates = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching estimates with params:", { currentPage, pageSize, statusFilter })

      const response = await getEstimates({
        page: currentPage,
        pageSize: pageSize,
        status: statusFilter || undefined,
      })

      console.log("Estimates API response:", response)
      setDebugInfo(response)

      if (response && response.data) {
        setEstimates(response.data)
        setTotalEstimates(response.total || 0)
        setFilteredEstimates(response.data)

        console.log("Set estimates:", response.data)
        console.log("Total estimates:", response.total)
      } else {
        console.log("No data in response")
        setEstimates([])
        setTotalEstimates(0)
        setFilteredEstimates([])
      }
    } catch (err: any) {
      console.error("Failed to fetch estimates:", err)
      setError("Failed to load estimates. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to load estimates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchEstimates()
  }, [currentPage, statusFilter])

  // Filter estimates based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEstimates(estimates)
      return
    }

    const filtered = estimates.filter(
      (estimate) =>
        estimate.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (estimate.display_id && estimate.display_id.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredEstimates(filtered)
  }, [searchTerm, estimates])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-500"
      case "Sent":
        return "bg-blue-500"
      case "Accepted":
        return "bg-green-500"
      case "Rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch {
      return "N/A"
    }
  }

  const formatCurrency = (amount: number) => {
    if (typeof amount !== "number" || isNaN(amount)) return "R 0.00"
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleRefresh = () => {
    fetchEstimates()
    toast({
      title: "Refreshed",
      description: "Estimate list has been refreshed",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Manage customer estimates and quotes</p>
          {debugInfo && (
            <p className="text-xs text-gray-500 mt-1">
              Debug: Found {debugInfo.total} records, showing {debugInfo.data?.length || 0}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/estimates/new">
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Create Estimate
            </Button>
          </Link>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estimates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8" />
              <span className="ml-2">Loading estimates...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchEstimates} className="mt-4 bg-transparent">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estimate ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Freight Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstimates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No estimates found</p>
                          <p className="text-xs text-gray-400">
                            {totalEstimates > 0
                              ? `${totalEstimates} total records in database`
                              : "Database appears to be empty"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEstimates.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell className="font-mono text-sm">{estimate.display_id || estimate.id}</TableCell>
                        <TableCell>{estimate.customer_name || "N/A"}</TableCell>
                        <TableCell>{formatDate(estimate.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(estimate.status)}>
                            {estimate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(estimate.total_amount)}</TableCell>
                        <TableCell>{estimate.freight_type || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/estimates/${estimate.id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              Showing {filteredEstimates.length} of {totalEstimates} estimates
              {debugInfo && (
                <span className="ml-2 text-xs">
                  (Page {currentPage}, API returned {debugInfo.data?.length || 0} records)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredEstimates.length < pageSize || loading}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
