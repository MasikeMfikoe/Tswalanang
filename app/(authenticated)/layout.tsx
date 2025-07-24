import type React from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Navigation } from "@/components/Navigation"
import { Toaster } from "@/components/ui/toaster" // Ensure Toaster is imported if used here

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredPermission={{ module: "any", action: "view" }}>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster /> {/* Toaster can be here or in root layout */}
      </div>
    </ProtectedRoute>
  )
}
