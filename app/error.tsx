"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary Caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600 text-3xl font-bold">Oops! Something went wrong.</CardTitle>
          <CardDescription className="text-gray-600 mt-2">We apologize for the inconvenience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">An error occurred while rendering this page. Please try again.</p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 p-3 rounded-md text-left text-sm text-gray-800 overflow-auto max-h-40">
              <h4 className="font-semibold mb-1">Error Details:</h4>
              <pre className="whitespace-pre-wrap break-all">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </div>
          )}
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full mt-2">
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
