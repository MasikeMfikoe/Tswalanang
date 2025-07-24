"use client"
import React from "react"
import { useRouter } from "next/navigation"

export default function AdminUsersPage() {
  const router = useRouter()

  React.useEffect(() => {
    // Redirect to the new user management interface
    router.replace("/user-management")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to the new user management interface</p>
      </div>
    </div>
  )
}
