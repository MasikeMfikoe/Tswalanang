"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Lock, LockOpen } from "lucide-react"

interface LivePreviewSectionProps {
  groupName: string
  permissions: Record<string, boolean>
  assignedUsersCount: number
  navigationStructure: any[]
}

export function LivePreviewSection({
  groupName,
  permissions,
  assignedUsersCount,
  navigationStructure,
}: LivePreviewSectionProps) {
  const isPathAllowed = (path: string) => {
    return permissions[path] || false
  }

  const renderNavigationItem = (item: any) => {
    const isAllowed = isPathAllowed(item.path)

    return (
      <div key={item.path} className="flex items-center space-x-2">
        {isAllowed ? <LockOpen className="h-4 w-4 text-green-500" /> : <Lock className="h-4 w-4 text-red-500" />}
        <span>{item.name}</span>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <p className="text-sm text-gray-500">
          See what the user experience will be like for users in the &quot;{groupName}&quot; group.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Assigned Users: {assignedUsersCount}</span>
          </div>
          <div className="space-y-1">{navigationStructure.map((item) => renderNavigationItem(item))}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LivePreviewSection
