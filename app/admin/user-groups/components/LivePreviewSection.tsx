import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface LivePreviewSectionProps {
  groupName: string
  permissions: Record<string, boolean>
  assignedUsers: string[]
}

export function LivePreviewSection({ groupName, permissions, assignedUsers }: LivePreviewSectionProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live Preview: {groupName || "New Group"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Permissions:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(permissions).map(([key, value]) =>
              value ? (
                <Badge key={key} variant="secondary">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </Badge>
              ) : null,
            )}
            {Object.values(permissions).every((val) => !val) && (
              <p className="text-sm text-gray-500">No permissions granted.</p>
            )}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="font-semibold mb-2">Assigned Users:</h4>
          <div className="flex flex-wrap gap-2">
            {assignedUsers.length > 0 ? (
              assignedUsers.map((user) => (
                <Badge key={user} variant="outline">
                  {user}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No users assigned.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
