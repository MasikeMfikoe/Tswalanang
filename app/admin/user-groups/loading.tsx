import { Skeleton } from "@/components/ui/skeleton"

export default function UserGroupsLoading() {
  return (
    <div className="flex h-screen w-full">
      <div className="w-64 border-r bg-gray-50/50 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex-1 p-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full col-span-full" />
      </div>
    </div>
  )
}
