"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleGoToDashboard = () => {
    if (user) {
      // Redirect based on user role
      if (user.role === "client") {
        router.push("/client-portal")
      } else if (
        user.role === "tracking" ||
        (user.role === "guest" && user.pageAccess.length === 1 && user.pageAccess.includes("shipmentTracker"))
      ) {
        router.push("/shipment-tracker")
      } else {
        router.push("/dashboard")
      }
    } else {
      router.push("/login")
    }
  }

  const handleLoginAsDifferentUser = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      // Force redirect even if logout fails
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>

          {user && (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <p>
                <strong>Current User:</strong> {user.name} {user.surname}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={handleGoToDashboard} className="w-full">
              {user?.role === "client"
                ? "Go to Client Portal"
                : user?.role === "tracking"
                  ? "Go to Shipment Tracker"
                  : "Go to Dashboard"}
            </Button>
            <Button variant="outline" onClick={handleLoginAsDifferentUser} className="w-full">
              Login as Different User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
