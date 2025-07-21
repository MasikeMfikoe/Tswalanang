import { Skeleton } from "@/components/ui/skeleton"

export default function NewCourierOrderLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[150px] w-full col-span-2" />
        <Skeleton className="h-[100px] w-full col-span-2" />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
