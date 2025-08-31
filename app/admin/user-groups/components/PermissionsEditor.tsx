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

// ---------- helpers to tolerate different permission shapes ----------
type AnyPerm = GroupPermission & Record<string, any>

const getPermPath = (p: AnyPerm): string =>
  p?.pagePath ?? p?.path ?? p?.route ?? p?.key ?? p?.slug ?? ""

const getPermAllowed = (p: AnyPerm): boolean =>
  Boolean(p?.allowed ?? p?.canAccess ?? p?.enabled ?? false)

const setPermAllowed = (p: AnyPerm, allowed: boolean): AnyPerm => {
  if ("allowed" in p) return { ...p, allowed }
  if ("canAccess" in p) return { ...p, canAccess: allowed }
  if ("enabled" in p) return { ...p, enabled: allowed }
  return { ...p, allowed }
}

// fixed class maps so Tailwind won't purge them
const indentClass = (depth: number) => {
  const map = ["", "ml-4", "ml-8", "ml-12", "ml-16"]
  return map[Math.min(depth, map.length - 1)]
}
const padLeftClass = (depth: number) => {
  const map = ["pl-4", "pl-4", "pl-8", "pl-12", "pl-16"]
  return map[Math.min(depth, map.length - 1)]
}

// ---------- navigation structure ----------
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

export default function PermissionsEditor({
  group,
  permissions,
  onUpdateGroupName,
  onUpdatePermissions,
}: PermissionsEditorProps) {
  const [activeTab, setActiveTab] = useState("permissions")

  // ✅ derive a safe default flag instead of using group.isDefault directly
  const isDefaultGroup = Boolean(
    (group as any)?.isDefault ??
      (group as any)?.is_default ??
      (group as any)?.isDefaultGroup ??
      (group as any)?.default ??
      (group as any)?.locked ?? // some schemas use locked/system
      (group?.name === "Super Admin")
  )

  const handlePermissionChange = (pagePath: string, allowed: boolean) => {
    const updated: GroupPermission[] = permissions.map((p) => {
      const pp = getPermPath(p as AnyPerm)
      return pp === pagePath ? (setPermAllowed(p as AnyPerm, allowed) as GroupPermission) : p
    })

    // cascade to children
    const childPaths = permissions
      .map((p) => getPermPath(p as AnyPerm))
      .filter((pp) => pp && pp.startsWith(pagePath + "/"))

    if (childPaths.length > 0) {
      childPaths.forEach((childPath) => {
        const idx = updated.findIndex((p) => getPermPath(p as AnyPerm) === childPath)
        if (idx !== -1) {
          updated[idx] = setPermAllowed(updated[idx] as AnyPerm, allowed) as GroupPermission
        }
      })
    }

    onUpdatePermissions(updated)
  }

  const isPathAllowed = (path: string) => {
    const perm = (permissions as AnyPerm[]).find((p) => getPermPath(p) === path)
    return perm ? getPermAllowed(perm) : false
  }

  const renderNavigationItem = (item: any, depth = 0) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const allowed = isPathAllowed(item.path)

    return (
      <div key={item.path} className="space-y-2">
        <div className={`flex items-center ${indentClass(depth)}`}>
          <Checkbox
            id={item.path}
            checked={allowed}
            onCheckedChange={(checked) => handlePermissionChange(item.path, checked === true)}
            disabled={isDefaultGroup} // ⬅️ use derived flag
          />
          <Label htmlFor={item.path} className="ml-2 font-medium">
            {item.name}
          </Label>
        </div>

        {hasChildren && (
          <div className={`${padLeftClass(depth + 1)} border-l ml-1.5 space-y-2`}>
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
          {isDefaultGroup ? (
            group.name
          ) : (
            <Input
              value={group.name}
              onChange={(e) => onUpdateGroupName(e.target.value)}
              className="max-w-sm font-bold"
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDefaultGroup && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This group has full access to all features and cannot be modified.
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
            <UserAssignmentSection groupId={(group as any).id} isDefaultGroup={isDefaultGroup} />
          </TabsContent>

          <TabsContent value="preview">
            <LivePreviewSection navigationStructure={navigationStructure} permissions={permissions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
