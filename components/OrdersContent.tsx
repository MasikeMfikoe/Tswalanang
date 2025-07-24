"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Trash2, FileText } from "lucide-react"
import { useOrdersQuery, useDeleteOrderMutation } from "@/hooks/useOrdersQuery"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderStatus } from "@/types/models"

export function OrdersContent() {
  const router = useRouter()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("Pending") // Updated default value

  const { data, isLoading, isError, error } = useOrdersQuery({
    page,
    pageSize,
    search: searchTerm,
    status: statusFilter === "Pending" ? undefined : statusFilter, // Updated condition
  })

  const deleteOrderMutation = useDeleteOrderMutation()

  const orders = data?.data || []
  const totalOrders = data?.total || 0
  const totalPages = data?.totalPages || 1

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleEditOrder = (orderId: string) => {
    // Implement edit functionality or navigate to edit page
    toast({
      title: "Edit Order",
      description: `Editing order ${orderId} (functionality to be implemented).`,
    })
  }

  const handleDeleteOrder = async (orderId: string, poNumber: string) => {
    if (confirm(`Are you sure you want to delete order ${poNumber}? This action cannot be undone.`)) {
      try {
        await deleteOrderMutation.mutateAsync(orderId)
        toast({
          title: "Success",
          description: `Order ${poNumber} deleted successfully.`,
        })
      } catch (err) {
        toast({
          title: "Error",
          description: `Failed to delete order: ${(err as Error).message}`,
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "Completed":
      case "Delivered":
        return "default"
      case "In Transit":
      case "Processing":
        return "secondary"
      case "Pending":
      case "On Hold":
        return "outline"
      case "Cancelled":
      case "Exception":
        return "destructive"
      case "Customs Clearance":
        return "info" // Assuming 'info' variant exists or can be styled
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Error loading orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error: {error?.message || "An unexpected error occurred."}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const orderStatuses: OrderStatus[] = [
    "Pending",
    "Processing",
    "In Transit",
    "Customs Clearance",
    "Delivered",
    "Completed",
    "Cancelled",
    "On Hold",
    "Exception",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Manage all customer orders and their statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={(value: OrderStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">All Statuses</SelectItem> {/* Updated value prop */}
                {orderStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => router.push("/orders/new")} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create New Order
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No orders found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || statusFilter ? "Try adjusting your search or filters." : "Start by creating a new order."}
            </p>
            {!searchTerm && !statusFilter && (
              <Button onClick={() => router.push("/orders/new")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Order
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        {order.origin_address.city}, {order.origin_address.country}
                      </TableCell>
                      <TableCell>
                        {order.destination_address.city}, {order.destination_address.country}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {order.currency} {order.total_value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{order.documents?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* <Button variant="outline" size="sm" onClick={() => handleEditOrder(order.id)} title="Edit Order">
                            <Edit className="h-4 w-4" />
                          </Button> */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id, order.po_number)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={() => setPage(Math.max(1, page - 1))} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={() => setPage(Math.min(totalPages, page + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  )
}
