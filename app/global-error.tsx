"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-red-500 mb-4">{error.message}</p>
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
