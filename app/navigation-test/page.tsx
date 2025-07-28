"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NavigationTestPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This page helps diagnose navigation issues with the "Create New Order" button.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Test Navigation Methods:</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    addLog("Using router.push('/orders/new')")
                    router.push("/orders/new")
                  }}
                >
                  router.push
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    addLog("Using router.push('/orders/new/simple-page')")
                    router.push("/orders/new/simple-page")
                  }}
                >
                  router.push to simple page
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    addLog("Using window.location.href")
                    window.location.href = "/orders/new"
                  }}
                >
                  window.location.href
                </Button>

                <a href="/orders/new" onClick={() => addLog("Using direct link")}>
                  <Button variant="outline" className="w-full">
                    Direct link
                  </Button>
                </a>

                <a href="/orders/new/simple-page" onClick={() => addLog("Using direct link to simple page")}>
                  <Button variant="outline" className="w-full">
                    Direct link to simple page
                  </Button>
                </a>

                <Link href="/orders/new" onClick={() => addLog("Using Next.js Link")}>
                  <Button variant="outline" className="w-full">
                    Next.js Link
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Navigation Logs:</h3>
              <div className="bg-gray-100 p-2 rounded-md h-[300px] overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs">No navigation attempts yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Other Navigation Links:</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/orders">
                <Button variant="outline">Back to Orders</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
