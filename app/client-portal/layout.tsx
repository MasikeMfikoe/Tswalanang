import type React from "react"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredPermission={{ module: "clientPortal", action: "view" }}>{children}</ProtectedRoute>
}
