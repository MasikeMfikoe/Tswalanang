import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User, Lock, Settings, FileText, Truck, DollarSign } from "lucide-react"

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
  const permissionIcons: Record<string, JSX.Element> = {
    canViewDashboard: <User className="h-4 w-4" />,
    canManageUsers: <Lock className="h-4 w-4" />,
    canEditSettings: <Settings className="h-4 w-4" />,
    canViewDocuments: <FileText className="h-4 w-4" />,
    canManageOrders: <Truck className="h-4 w-4" />,
    canViewFinancials: <DollarSign className="h-4 w-4" />,
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Live Preview: {groupName || "New Group"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Permissions</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {permissionIcons[key]}
                <span>{key.replace(/([A-Z])/g, " $1").replace(/^can/, "")}</span>
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Assigned Users</h3>
          <Badge variant="secondary" className="text-base">
            <User className="h-4 w-4 mr-1" /> {assignedUsersCount} Users
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
