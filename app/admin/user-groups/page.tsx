// app/admin/user-groups/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Save, Users } from "lucide-react"
import UserGroupsSidebar from "./components/UserGroupsSidebar"
import PermissionsEditor from "./components/PermissionsEditor"
import ConfirmationDialog from "./components/ConfirmationDialog"
import type { UserGroup, GroupPermissionPage } from "@/types/auth"

// ---- mock groups (shape matches UserGroup) ----
const now = new Date().toISOString()
const initialGroups: UserGroup[] = [
  { id: "1", name: "Super Admin", description: "Full access",  permissions: [], users: [], created_at: now, updated_at: now, isDefault: true },
  { id: "2", name: "Sales",       description: "Sales team",   permissions: [], users: [], created_at: now, updated_at: now, isDefault: false },
  { id: "3", name: "HR",          description: "HR team",      permissions: [], users: [], created_at: now, updated_at: now, isDefault: false },
  { id: "4", name: "Support",     description: "Support team", permissions: [], users: [], created_at: now, updated_at: now, isDefault: false },
  { id: "5", name: "Guest",       description: "Limited",      permissions: [], users: [], created_at: now, updated_at: now, isDefault: true },
]

export default function AdminUserGroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [groups, setGroups] = useState<UserGroup[]>(initialGroups)
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [permissions, setPermissions] = useState<GroupPermissionPage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // gate non-admins
  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      toast({ title: "Access Denied", description: "You don't have admin privileges.", variant: "destructive" })
      router.push("/dashboard")
    }
  }, [user, isLoading, router, toast])

  // load page-level permissions for preview
  useEffect(() => {
    if (!selectedGroup) return
    const mock: GroupPermissionPage[] = [
      { id: "1",  groupId: selectedGroup.id, pagePath: "/dashboard",                   allowed: true },
      { id: "2",  groupId: selectedGroup.id, pagePath: "/orders",                      allowed: selectedGroup.id !== "5" },
      { id: "3",  groupId: selectedGroup.id, pagePath: "/orders/new",                  allowed: selectedGroup.id !== "5" },
      { id: "4",  groupId: selectedGroup.id, pagePath: "/documents",                   allowed: true },
      { id: "5",  groupId: selectedGroup.id, pagePath: "/settings",                    allowed: selectedGroup.id === "1" },
      { id: "6",  groupId: selectedGroup.id, pagePath: "/settings/users",              allowed: selectedGroup.id === "1" },
      { id: "7",  groupId: selectedGroup.id, pagePath: "/settings/billing",            allowed: selectedGroup.id === "1" },
      { id: "8",  groupId: selectedGroup.id, pagePath: "/analytics",                   allowed: selectedGroup.id !== "5" },
      { id: "9",  groupId: selectedGroup.id, pagePath: "/analytics/reports",           allowed: selectedGroup.id !== "5" },
      { id: "10", groupId: selectedGroup.id, pagePath: "/analytics/reports/monthly",   allowed: selectedGroup.id !== "5" },
    ]
    setPermissions(mock)
  }, [selectedGroup])

  const handleCreateGroup = () => {
    const g: UserGroup = {
      id: `group-${Date.now()}`,
      name: "New Group",
      description: "",
      permissions: [],
      users: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isDefault: false,
    }
    setGroups(prev => [...prev, g])
    setSelectedGroup(g)
    console.log(`Admin ${user?.username} created group "${g.name}" @ ${new Date().toISOString()}`)
    setHasChanges(true)
  }

  const handleSelectGroup = (g: UserGroup) => {
    if (hasChanges) { setShowConfirmation(true); return }
    setSelectedGroup(g)
  }

  const handleUpdateGroupName = (name: string) => {
    if (!selectedGroup || selectedGroup.isDefault) return
    setSelectedGroup({ ...selectedGroup, name })
    setGroups(prev => prev.map(g => (g.id === selectedGroup.id ? { ...g, name } : g)))
    setHasChanges(true)
  }

  const handleUpdatePermissions = (updated: GroupPermissionPage[]) => {
    setPermissions(updated)
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    try {
      // TODO: persist via API/Supabase
      await new Promise(res => setTimeout(res, 600))
      toast({ title: "Success", description: `Permissions updated for ${selectedGroup?.name}` })
      setHasChanges(false)
    } catch {
      toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmNavigation = (confirm: boolean) => {
    setShowConfirmation(false)
    if (confirm) setHasChanges(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Group Permissions</h1>
        <Button onClick={handleSaveChanges} disabled={!hasChanges || isSubmitting || !selectedGroup}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">User Groups</CardTitle>
                <Button size="sm" onClick={handleCreateGroup}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserGroupsSidebar groups={groups} selectedGroup={selectedGroup} onSelectGroup={handleSelectGroup} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedGroup ? (
            <PermissionsEditor
              group={selectedGroup}
              permissions={permissions}
              onUpdateGroupName={handleUpdateGroupName}
              onUpdatePermissions={handleUpdatePermissions}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Select a user group from the sidebar or create a new one to manage permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={() => handleConfirmNavigation(true)}
        onCancel={() => handleConfirmNavigation(false)}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
      />
    </div>
  )
}
