"use client"

import { useEffect } from "react"

interface GlobalErrorProps {
  error: unknown
  reset?: () => void
}

/**
 * A resilient global error boundary for the App Router.
 * It logs the error, shows a readable description, and offers a retry.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // Log the error once when it happens
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[Global Error Boundary]", error)
  }, [error])

  /**
   * Ensure we always render a string.  If the error is:
   *   • a React element – convert to string
   *   • a plain object  – JSON-stringify it nicely
   *   • anything else   – String() fallback
   */
  const readableError =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message || error.toString()
        : JSON.stringify(error, null, 2)

  const handleRetry = () => {
    if (typeof reset === "function") {
      // Try to re-render the failed segment
      reset()
    } else {
      // Fallback: full page reload
      window.location.reload()
    }
  }

  return (
    /* global-error must include html + body */
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>

        <pre className="max-w-xl whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm text-gray-800 shadow-inner">
          {readableError}
        </pre>

        <button
          onClick={handleRetry}
          className="mt-6 px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
