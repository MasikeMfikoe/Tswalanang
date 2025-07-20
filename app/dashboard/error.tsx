"use client" // Error components must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-red-600">Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">We're sorry, but an unexpected error occurred. Please try again.</p>
          {process.env.NODE_ENV === "development" && (
            <div className="text-left p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
              <p className="font-semibold">Error Details:</p>
              <pre className="whitespace-pre-wrap break-all">{error.message}</pre>
              {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
            </div>
          )}
          <Button onClick={() => reset()}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  )
}
