export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="ml-4 text-gray-700">Loading tracking details...</p>
    </div>
  )
}
