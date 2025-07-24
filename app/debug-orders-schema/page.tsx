"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugOrdersSchemaPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Fetch just one order to see the schema
      const { data, error } = await supabase.from("orders").select("*").limit(1)

      if (error) {
        setError(error.message)
        return
      }

      setOrders(data || [])
      console.log("Orders data:", data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders Table Schema Debug</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {orders.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Available Columns:</h3>
              <ul className="list-disc pl-6 mb-4">
                {Object.keys(orders[0]).map((key) => (
                  <li key={key}>
                    <strong>{key}:</strong> {typeof orders[0][key]} - {JSON.stringify(orders[0][key])}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold mb-2">Sample Order Data:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(orders[0], null, 2)}</pre>
            </div>
          )}

          {orders.length === 0 && !error && <div className="text-gray-600">No orders found in the database.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
