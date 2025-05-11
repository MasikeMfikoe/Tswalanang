"use client"

interface ErrorDisplayProps {
  title: string
  message: string
}

export function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-red-500 mb-4">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
