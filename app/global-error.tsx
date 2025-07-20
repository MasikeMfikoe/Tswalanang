"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-red-600">Application Error!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Something critical went wrong across the application. We're working to fix it.
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="text-left p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
                  <p className="font-semibold">Error Details:</p>
                  <pre className="whitespace-pre-wrap break-all">{error.message}</pre>
                  {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
                </div>
              )}
              <Button onClick={() => reset()}>Reload Application</Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
