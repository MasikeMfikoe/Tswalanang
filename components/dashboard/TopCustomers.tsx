import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const topCustomers = [
  { id: "1", name: "Acme Corp", email: "contact@acmecorp.com", orders: 120, revenue: 150000 },
  { id: "2", name: "Globex Inc", email: "info@globex.com", orders: 90, revenue: 120000 },
  { id: "3", name: "Stark Industries", email: "sales@stark.com", orders: 75, revenue: 90000 },
  { id: "4", name: "Wayne Enterprises", email: "support@wayne.com", orders: 60, revenue: 80000 },
  { id: "5", name: "Cyberdyne Systems", email: "hr@cyberdyne.com", orders: 50, revenue: 70000 },
]

export function TopCustomers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Customers</CardTitle>
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
            {topCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </div>
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
