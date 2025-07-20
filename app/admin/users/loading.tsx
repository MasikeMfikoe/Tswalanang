import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="User Management" description="Manage internal and client users." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Cards Skeleton */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-32" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-48 mt-1" />
              </p>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create User Button Skeleton */}
      <div className="mt-6 flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
