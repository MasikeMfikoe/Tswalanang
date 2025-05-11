export default function NotFound() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p className="mb-4">Could not find the requested resource</p>
      <a href="/">Return Home</a>
    </div>
  )
}
