import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export default function TrackingWelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Track Your Shipment</CardTitle>
          <p className="text-muted-foreground">Enter your tracking number below.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative">
            <Input type="text" placeholder="Enter tracking number" className="w-full pr-10" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button className="w-full">Track Shipment</Button>
          <div className="text-center text-sm text-muted-foreground">
            Or{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>{" "}
            for more options.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
