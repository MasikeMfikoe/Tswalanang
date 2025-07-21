"use client" // Error boundaries must be Client Components

import { useEffect } from "react"

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
    // global-error must include html and body tags
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
          <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-4">
            <h2 className="text-3xl font-bold text-red-600">Oops! Something went wrong.</h2>
            <p className="text-gray-700 dark:text-gray-300">We're sorry, but an unexpected error occurred.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error.message || "Please try again or contact support if the issue persists."}
            </p>
            <button
              onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
              }
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
