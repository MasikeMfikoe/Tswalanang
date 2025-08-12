"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import TrackingUserCreator from "@/components/TrackingUserCreator"
import { Button } from "@/components/ui/button"

export default function CreateTrackingUserPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()

  // Check if user has admin permissions
  useEffect(() => {
    if (user && !hasPermission("admin", "create")) {
      router.push("/unauthorized")
    }
  }, [user, hasPermission, router])

  if (!user || !hasPermission("admin", "create")) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Tracking User</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/admin/tracking-users")}>
            Back to Tracking Users
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>

      <div className="my-8">
        <TrackingUserCreator />
      </div>
    </div>
  )
}
