"use client"

import type React from "react"
import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage(): ReactElement {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const router = useRouter()
  const { login, isAuthenticated, isLoading, user } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("User is already authenticated, redirecting to dashboard")

      // Check if user is a tracking user
      if (
        user &&
        (user.role === "tracking" ||
          (user.role === "guest" && user.pageAccess.length === 1 && user.pageAccess.includes("shipmentTracker")))
      ) {
        router.push("/shipment-tracker")
      } else if (user && user.role === "client") {
        router.push("/client-portal")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submitted")

    // Reset errors
    setErrors({})
    setFormError(null)

    setIsLoggingIn(true)

    try {
      console.log("Attempting login with credentials")
      const success = await login(username, password)
      console.log("Login result:", success)

      if (success) {
        console.log("Login successful")
        // Redirect will be handled by useEffect above
      } else {
        console.log("Login failed")
        setFormError("Invalid username or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      setFormError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to TSW SmartLog</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the logistics management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? "border-red-500" : ""}
                disabled={isLoggingIn}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                disabled={isLoggingIn}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <span>Demo credentials: </span>
            <code className="bg-muted px-1 py-0.5 rounded">username: demo, password: demo</code>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <span>Client users: </span>
            <code className="bg-muted px-1 py-0.5 rounded">client1/client1, client2/client2</code>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <span>Tracking user: </span>
            <code className="bg-muted px-1 py-0.5 rounded">username: tracking, password: tracking</code>
          </div>
          <Link href="/" className="w-full">
            <Button type="button" variant="outline" className="w-full bg-transparent">
              Back to Landing Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
