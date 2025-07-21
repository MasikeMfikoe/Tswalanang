import { Skeleton } from "@/components/ui/skeleton"

export default function CourierOrdersDetailsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-[300px] w-full" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-[250px] w-full" />
      </div>
    </div>
  )
}
