"use client"

import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardContent from "@/components/DashboardContent"

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermission={{ module: "dashboard", action: "view" }}>
      <DashboardContent />
    </ProtectedRoute>
  )
}
