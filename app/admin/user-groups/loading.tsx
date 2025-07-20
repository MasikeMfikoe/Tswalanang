import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserGroupsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="User Groups" description="Manage user roles and permissions." />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-180px)]">
        {/* Sidebar Skeleton */}
        <div className="flex flex-col h-full border-r bg-gray-100/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="grid gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="mt-auto pt-4 border-t">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-64" /> {/* Group Name Input */}
          <Skeleton className="h-48 w-full" /> {/* Permissions Editor */}
          <Skeleton className="h-32 w-full" /> {/* User Assignment */}
          <Skeleton className="h-48 w-full" /> {/* Live Preview */}
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
