"use client"

import ProtectedRoute from "@/components/ProtectedRoute"
import AuditTrailContent from "@/components/AuditTrailContent"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AuditTrailPage() {
  const router = useRouter()

  return (
    <ProtectedRoute requiredPermission={{ module: "auditTrail", action: "view" }}>
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
      <AuditTrailContent />
    </ProtectedRoute>
  )
}
