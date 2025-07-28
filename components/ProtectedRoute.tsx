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
        return
      }

      // CLIENT USERS: Only allow access to client portal and shipment tracker
      if (user.role === "client") {
        if (requiredPermission.module !== "clientPortal" && requiredPermission.module !== "shipmentTracker") {
          console.log("Client user trying to access unauthorized page, redirecting to /client-portal")
          router.push("/client-portal")
          return
        }
      }

      // TRACKING USERS: Only allow access to shipment tracker
      if (
        user.role === "guest" &&
        user.pageAccess.length === 1 &&
        user.pageAccess.includes("shipmentTracker") &&
        requiredPermission.module !== "shipmentTracker"
      ) {
        console.log("Tracking user trying to access non-tracking page, redirecting to /shipment-tracker")
        router.push("/shipment-tracker")
        return
      }

      // GENERAL PERMISSION CHECK for other users
      if (!hasPermission(requiredPermission.module, requiredPermission.action)) {
        console.log("No permission, redirecting to /unauthorized")
        router.push("/unauthorized")
        return
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

  // If not authenticated, render nothing (will redirect)
  if (!user) {
    return null
  }

  // For client users, only allow access to client portal and shipment tracker
  if (
    user.role === "client" &&
    requiredPermission.module !== "clientPortal" &&
    requiredPermission.module !== "shipmentTracker"
  ) {
    return null // Will redirect
  }

  // For tracking users, only allow access to shipment tracker
  if (
    user.role === "guest" &&
    user.pageAccess.length === 1 &&
    user.pageAccess.includes("shipmentTracker") &&
    requiredPermission.module !== "shipmentTracker"
  ) {
    return null // Will redirect
  }

  // Check general permissions
  if (!hasPermission(requiredPermission.module, requiredPermission.action)) {
    return null // Will redirect
  }

  return <>{children}</>
}

export default ProtectedRoute
