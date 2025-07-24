"use client"

import ClientPackDocuments from "@/components/ClientPackDocuments"
import ProtectedRoute from "@/components/ProtectedRoute"
import { PageHeader } from "@/components/ui/page-header"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function ClientDocumentsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute requiredPermission={{ module: "clientPortal", action: "view" }}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageHeader title="Your Documents" description="Access all documents related to your orders." />
        {/* ClientPackDocuments component will fetch documents for the logged-in client user */}
        <ClientPackDocuments />
      </div>
    </ProtectedRoute>
  )
}
