// app/admin/user-groups/components/PermissionsEditor.tsx
"use client"

import { useState } from "react"
import type { UserGroup, GroupPermissionPage } from "@/types/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import UserAssignmentSection from "./UserAssignmentSection"
import LivePreviewSection from "./LivePreviewSection"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// App navigation structure
const navigationStructure = [
  { name: "Dashboard", path: "/dashboard", icon: "BarChart" },
  {
    name: "Orders",
    path: "/orders",
    icon: "Package",
    children: [
      { name: "New Order", path: "/orders/new", icon: "Plus" },
      { name: "Order List", path: "/orders/list", icon: "List" },
    ],
  },
  { name: "Documents", path: "/documents", icon: "FileText" },
  {
    name: "Analytics",
    path: "/analytics",
    icon: "BarChart",
    children: [
      {
        name: "Reports",
        path: "/analytics/reports",
        icon: "FileText",
        children: [
          { name: "Monthly", path: "/analytics/reports/monthly", icon: "Calendar" },
          { name: "Quarterly", path: "/analytics/reports/quarterly", icon: "Calendar" },
        ],
      },
      { name: "Dashboards", path: "/analytics/dashboards", icon: "Layout" },
    ],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "Settings",
    children: [
      { name: "Users", path: "/settings/users", icon: "Users" },
      { name: "Billing", path: "/settings/billing", icon: "CreditCard" },
      { name: "Tickets", path: "/settings/tickets", icon: "Ticket" },
    ],
  },
]

interface Props {
  group: UserGroup
  permissions: GroupPermissionPage[]
  onUpdateGroupName: (name: string) => void
  onUpdatePermissions: (permissions: GroupPermissionPage[]) => void
}

export default function PermissionsEditor({
  group,
  permissions,
  onUpdateGroupName,
  onUpdatePermissions,
}: Props) {
  const [activeTab, setActiveTab] = useState("permissions")

  // Toggle page-level permission (pagePath + allowed)
  const handlePermissionChange = (pagePath: string, allowed: boolean) => {
    const idx = permissions.findIndex((p) => p.pagePath === pagePath)
    let updated = [...permissions]

    if (idx >= 0) {
      updated[idx] = { ...updated[idx], allowed }
    } else {
      updated.push({
        id: crypto.randomUUID(),
        groupId: group.id,
        pagePath,
        allowed,
      })
    }

    onUpdatePermissions(updated)
  }

  const isPathAllowed = (path: string) => {
    const p = permissions.find((p) => p.pagePath === path)
    return !!p?.allowed
  }

  const renderNavigationItem = (item: any, depth = 0) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const isAllowed = isPathAllowed(item.path)

    return (
      <div key={item.path} className="space-y-2">
        <div className={`flex items-center ${depth > 0 ? `ml-${depth * 4}` : ""}`}>
          <Checkbox
            id={item.path}
            checked={isAllowed}
            onCheckedChange={(checked) => handlePermissionChange(item.path, !!checked)}
            disabled={!!group.isDefault} // lock default groups
          />
          <Label htmlFor={item.path} className="ml-2 font-medium">
            {item.name}
          </Label>
        </div>

        {hasChildren && (
          <div className={`pl-${depth > 0 ? (depth + 1) * 4 : 4} border-l ml-1.5 space-y-2`}>
            {item.children.map((child: any) => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          <Input
            value={group.name}
            onChange={(e) => onUpdateGroupName(e.target.value)}
            className="max-w-sm font-bold"
            disabled={!!group.isDefault}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {group.isDefault && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Default groups have locked names and restricted edits.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="permissions">Navigation Permissions</TabsTrigger>
            <TabsTrigger value="users">Assign Users</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            {navigationStructure.map((item) => renderNavigationItem(item))}
          </TabsContent>

          <TabsContent value="users">
            <UserAssignmentSection groupId={group.id} isDefaultGroup={!!group.isDefault} />
          </TabsContent>

          <TabsContent value="preview">
            <LivePreviewSection navigationStructure={navigationStructure} permissions={permissions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
