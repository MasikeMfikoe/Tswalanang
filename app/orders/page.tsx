import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { OrdersContent } from "@/components/OrdersContent"

export default function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Orders</h1>
        <Link href="/orders/new-order" passHref>
          <Button>Create New Order</Button>
        </Link>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Overview of all customer orders and their current status.</CardDescription>
            <div className="relative w-full max-w-sm">
              <Input placeholder="Search orders..." className="pr-10" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <OrdersContent />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
