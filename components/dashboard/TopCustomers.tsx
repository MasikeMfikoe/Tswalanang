import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"

export function TopCustomers() {
  const topCustomers = [
    { name: "Acme Corp", orders: 120, revenue: 50000 },
    { name: "Global Logistics", orders: 90, revenue: 45000 },
    { name: "Tech Solutions", orders: 75, revenue: 30000 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  {customer.name}
                </TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell className="text-right">${customer.revenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
