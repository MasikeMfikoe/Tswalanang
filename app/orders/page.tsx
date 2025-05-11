"use client"

import { useRouter } from "next/navigation"
import { OrdersContent } from "@/components/OrdersContent"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function OrdersPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredPermission={{ module: "orders", action: "view" }}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">{/* h1 element removed */}</div>

        {/* Keeping only the OrdersContent component */}
        <OrdersContent />
      </div>
    </ProtectedRoute>
  )
}
