"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import CreateOrder from "@/components/CreateOrder"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user has permission to create orders
    // This is a simplified version without the ProtectedRoute wrapper
    const hasPermission = true // In a real app, you would check this

    if (!hasPermission) {
      router.push("/unauthorized")
    }
  }, [router])

  return (
    <div>
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Order</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
      <CreateOrder />
    </div>
  )
}
