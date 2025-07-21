import { Skeleton } from "@/components/ui/skeleton"

export default function TrackingWelcomeLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Skeleton className="h-16 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-8" />
      <Skeleton className="h-12 w-80 rounded-full mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
