"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { estimates } from "@/lib/sample-data"
import { FileText, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function EstimatesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEstimates, setFilteredEstimates] = useState(estimates)

  useEffect(() => {
    // In a real app, this would be an API call
    const filtered = estimates.filter(
      (estimate) =>
        estimate.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEstimates(filtered)
  }, [searchTerm])

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
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Manage customer estimates and quotes</p>
        </div>
        <Link href="/estimates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
          <CardDescription>View and manage all customer estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

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
                    <TableCell colSpan={7} className="text-center py-4">
                      No estimates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell>{estimate.id}</TableCell>
                      <TableCell>{estimate.customerName}</TableCell>
                      <TableCell>{formatDate(estimate.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(estimate.status)}>
                          {estimate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(estimate.totalAmount)}</TableCell>
                      <TableCell>{estimate.freightType}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
