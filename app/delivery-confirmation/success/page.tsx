import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DeliverySuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-green-600">Delivery Confirmed!</CardTitle>
          <CardDescription>Shipment #XYZ789 has been successfully marked as delivered.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Thank you for confirming the delivery. The system has been updated.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" passHref>
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/deliveries" passHref>
              <Button variant="outline" className="w-full bg-transparent">
                View All Deliveries
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
