import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DebugRoutingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Debug Routing</h1>
      </header>
      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Routing Test Links</CardTitle>
            <CardDescription>Test various Next.js App Router routing behaviors.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/orders/new" passHref>
              <Button className="w-full justify-start">Go to /orders/new (Layout Test)</Button>
            </Link>
            <Link href="/orders/new/simple-page" passHref>
              <Button className="w-full justify-start">Go to /orders/new/simple-page (Nested Page)</Button>
            </Link>
            <Link href="/orders/new-order" passHref>
              <Button className="w-full justify-start">Go to /orders/new-order (Direct Page)</Button>
            </Link>
            <Link href="/dashboard" passHref>
              <Button className="w-full justify-start">Go to /dashboard</Button>
            </Link>
            <Link href="/non-existent-route" passHref>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                Go to Non-Existent Route (404)
              </Button>
            </Link>
            <Link href="/dashboard/error" passHref>
              <Button className="w-full justify-start" variant="destructive">
                Trigger Dashboard Error
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
