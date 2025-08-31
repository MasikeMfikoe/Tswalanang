"use client"

import { useState } from "react"
import type { UserGroup, GroupPermission } from "@/types/auth"
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

interface PermissionsEditorProps {
  group: UserGroup
  permissions: GroupPermission[]
  onUpdateGroupName: (name: string) => void
  onUpdatePermissions: (permissions: GroupPermission[]) => void
}

/** Convert a route like "/orders/new" -> "orders" to match GroupPermission.module */
function pathToModule(path: string): string {
  const first = path.split("/").filter(Boolean)[0] ?? ""
  return first || "dashboard"
}

export default function PermissionsEditor({
  group,
  permissions,
  onUpdateGroupName,
  onUpdatePermissions,
}: PermissionsEditorProps) {
  const [activeTab, setActiveTab] = useState("permissions")

  // Toggle VIEW permission for the module that corresponds to a given path
  const handlePermissionChange = (pagePath: string, allowed: boolean) => {
    const mod = pathToModule(pagePath)

    const idx = permissions.findIndex((p) => p.module === mod)
    let updated = [...permissions]

    if (idx >= 0) {
      updated[idx] = { ...updated[idx], view: allowed }
    } else {
      // If module not present, create a new permission entry for it
      updated.push({
        id: crypto.randomUUID(),
        group_id: group.id,
        module: mod,
        view: allowed,
        create: false,
        edit: false,
        delete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    onUpdatePermissions(updated)
  }

  const isPathAllowed = (path: string) => {
    const mod = pathToModule(path)
    const perm = permissions.find((p) => p.module === mod)
    return !!perm?.view
  }

  const renderNavigationItem = (item: any, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isAllowed = isPathAllowed(item.path)

    return (
      <div key={item.path} className="space-y-2">
        <div className={`flex items-center ${depth > 0 ? `ml-${depth * 4}` : ""}`}>
          <Checkbox
            id={item.path}
            checked={isAllowed}
            onCheckedChange={(checked) => handlePermissionChange(item.path, !!checked)}
            // Optional: protect a special group name if you use one
            disabled={group.name === "Super Admin"}
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
          {/* Rename group inline unless you deliberately lock the name by convention */}
          <Input value={group.name} onChange={(e) => onUpdateGroupName(e.target.value)} className="max-w-sm font-bold" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {group.name === "Super Admin" && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Super Admin group has full access to all features and cannot be modified.
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
            {/* Pass a boolean if you need to lock assignment for a special group name */}
            <UserAssignmentSection groupId={group.id} isDefaultGroup={group.name === "Super Admin"} />
          </TabsContent>

          <TabsContent value="preview">
            <LivePreviewSection navigationStructure={navigationStructure} permissions={permissions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
