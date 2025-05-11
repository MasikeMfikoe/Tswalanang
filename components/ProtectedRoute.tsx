"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission: {
    module: string
    action: "view" | "create" | "edit" | "delete"
  }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { user, isLoading, hasPermission } = useAuth()

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check permissions and redirect if needed
  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        console.log("No user, redirecting to /login")
        router.push("/login")
      } else if (
        // Special case for tracking users - they can only access shipment tracker
        user.role === "guest" &&
        user.pageAccess.length === 1 &&
        user.pageAccess.includes("shipmentTracker") &&
        requiredPermission.module !== "shipmentTracker"
      ) {
        console.log("Tracking user trying to access non-tracking page, redirecting to /shipment-tracker")
        router.push("/shipment-tracker")
      } else if (!hasPermission(requiredPermission.module, requiredPermission.action)) {
        console.log("No permission, redirecting to /unauthorized")
        router.push("/unauthorized")
      }
    }
  }, [mounted, user, isLoading, hasPermission, router, requiredPermission])

  // During server-side rendering or before mounting, render nothing
  if (!mounted) {
    return null
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated or not authorized, render nothing
  if (!user || !hasPermission(requiredPermission.module, requiredPermission.action)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
