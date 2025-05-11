"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SimpleDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium">Welcome to TSW SmartLog Dashboard</h2>
            <p className="text-gray-500">This is a simplified dashboard page for troubleshooting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Total Orders</h3>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Active Orders</h3>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">Completed Orders</h3>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button className="bg-black text-white px-4 py-2 rounded" onClick={() => router.push("/orders")}>
              View Orders
            </button>
            <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => router.push("/")}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
