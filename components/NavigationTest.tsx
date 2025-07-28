"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NavigationTest() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Navigation Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium mb-2">Test Navigation Methods:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  addLog("Using router.push('/orders/new-order')")
                  router.push("/orders/new-order")
                }}
                className="w-full"
              >
                router.push
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  addLog("Using window.location.href")
                  window.location.href = "/orders/new-order"
                }}
                className="w-full"
              >
                window.location.href
              </Button>

              <Link href="/orders/new-order" onClick={() => addLog("Using Next.js Link")}>
                <Button variant="outline" className="w-full">
                  Next.js Link
                </Button>
              </Link>

              <a href="/orders/new-order" onClick={() => addLog("Using regular anchor tag")}>
                <Button variant="outline" className="w-full">
                  Regular anchor tag
                </Button>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Navigation Logs:</h3>
            <div className="bg-gray-100 p-2 rounded-md h-[200px] overflow-y-auto">
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
      </CardContent>
    </Card>
  )
}
