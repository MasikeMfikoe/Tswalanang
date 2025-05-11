"use client"

import { useEffect } from "react"
import { useToast } from "@/lib/toast" // Import useToast hook instead of direct toast function

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { toast } = useToast() // Use the hook to get the toast function

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)

    // Show error toast - now using the toast function from the hook
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    })
  }, [error, toast])

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-red-500 mb-4">{error.message || "An unexpected error occurred"}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Try again
      </button>
    </div>
  )
}
