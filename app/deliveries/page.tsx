import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

// Mock data for deliveries
const mockDeliveries = [
  {
    id: "DEL001",
    orderId: "ORD001",
    status: "Out for Delivery",
    driver: "John Doe",
    eta: "2024-07-20 14:00",
    origin: "Warehouse A",
    destination: "Customer X",
  },
  {
    id: "DEL002",
    orderId: "ORD002",
    status: "Delivered",
    driver: "Jane Smith",
    eta: "2024-07-19 10:30",
    origin: "Warehouse B",
    destination: "Customer Y",
  },
  {
    id: "DEL003",
    orderId: "ORD003",
    status: "Pending Pickup",
    driver: "Mike Johnson",
    eta: "2024-07-21 09:00",
    origin: "Supplier C",
    destination: "Warehouse A",
  },
  {
    id: "DEL004",
    orderId: "ORD004",
    status: "In Transit",
    driver: "Sarah Lee",
    eta: "2024-07-20 18:00",
    origin: "Port of LA",
    destination: "Distribution Center",
  },
  {
    id: "DEL005",
    orderId: "ORD005",
    status: "Delivered",
    driver: "John Doe",
    eta: "2024-07-18 16:00",
    origin: "Warehouse A",
    destination: "Customer Z",
  },
]

export default function DeliveriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Deliveries" description="Monitor and manage all ongoing and completed deliveries." />

      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.orderId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        delivery.status === "Delivered"
                          ? "success"
                          : delivery.status === "Out for Delivery"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{delivery.driver}</TableCell>
                  <TableCell>{delivery.eta}</TableCell>
                  <TableCell>{delivery.origin}</TableCell>
                  <TableCell>{delivery.destination}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/delivery-confirmation/${delivery.id}`}>
                      <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
