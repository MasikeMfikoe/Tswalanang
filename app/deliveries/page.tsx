import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

export default function DeliveriesPage() {
  const deliveries = [
    {
      id: "DEL001",
      orderId: "ORD001",
      status: "Delivered",
      origin: "Shanghai",
      destination: "Rotterdam",
      eta: "2024-07-20",
      actualDelivery: "2024-07-19",
      carrier: "Maersk",
      trackingNumber: "MAEU1234567",
    },
    {
      id: "DEL002",
      orderId: "ORD002",
      status: "In Transit",
      origin: "New York",
      destination: "London",
      eta: "2024-07-25",
      actualDelivery: "-",
      carrier: "DHL",
      trackingNumber: "DHL987654321",
    },
    {
      id: "DEL003",
      orderId: "ORD003",
      status: "Pending",
      origin: "Dubai",
      destination: "Singapore",
      eta: "2024-07-30",
      actualDelivery: "-",
      carrier: "Emirates SkyCargo",
      trackingNumber: "EK654321",
    },
    {
      id: "DEL004",
      orderId: "ORD004",
      status: "Delivered",
      origin: "Hamburg",
      destination: "Cape Town",
      eta: "2024-07-10",
      actualDelivery: "2024-07-10",
      carrier: "MSC",
      trackingNumber: "MSCU7890123",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Deliveries</h1>
        <Button>Add New Delivery</Button>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Deliveries</CardTitle>
            <CardDescription>Overview of all shipments and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Actual Delivery</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>{delivery.orderId}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delivery.status === "Delivered"
                            ? "success"
                            : delivery.status === "In Transit"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{delivery.origin}</TableCell>
                    <TableCell>{delivery.destination}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      {delivery.eta}
                    </TableCell>
                    <TableCell>{delivery.actualDelivery}</TableCell>
                    <TableCell>{delivery.carrier}</TableCell>
                    <TableCell>{delivery.trackingNumber}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
