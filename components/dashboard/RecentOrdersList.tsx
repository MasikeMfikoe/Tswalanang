import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Order } from "@/types/models" // Assuming Order type is defined here

interface RecentOrdersListProps {
  recentOrders: Order[]
}

export function RecentOrdersList({ recentOrders }: RecentOrdersListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentOrders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
              No recent orders found.
            </TableCell>
          </TableRow>
        ) : (
          recentOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "Delivered" ? "success" : order.status === "In Transit" ? "secondary" : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {order.currency} {order.totalValue?.toFixed(2)}
              </TableCell>
              <TableCell>{new Date(order.lastUpdate).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Link href={`/orders/${order.id}`} passHref>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
