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
import type { UserGroup, GroupPermission } from "@/types/auth"

// Mock data for initial development
const initialGroups: UserGroup[] = [
  {
    id: "1",
    name: "Super Admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: [],
    users: [],
  },
  {
    id: "2",
    name: "Sales",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: [],
    users: [],
  },
  {
    id: "3",
    name: "HR",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: [],
    users: [],
  },
  {
    id: "4",
    name: "Support",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: [],
    users: [],
  },
  {
    id: "5",
    name: "Guest",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: [],
    users: [],
  },
]

export default function AdminUserGroupsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [groups, setGroups] = useState<UserGroup[]>(initialGroups)
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [permissions, setPermissions] = useState<GroupPermission[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Check if user is Super Admin
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router, toast])

  // Load group permissions when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      // In a real app, this would fetch from API
      // For now, we'll use mock data
      const mockPermissions: GroupPermission[] = [
        { id: "1", group_id: selectedGroup.id, module: "/dashboard", view: true },
        { id: "2", group_id: selectedGroup.id, module: "/orders", view: selectedGroup.id !== "5" },
        { id: "3", group_id: selectedGroup.id, module: "/orders/new", view: selectedGroup.id !== "5" },
        { id: "4", group_id: selectedGroup.id, module: "/documents", view: true },
        { id: "5", group_id: selectedGroup.id, module: "/settings", view: selectedGroup.id === "1" },
        { id: "6", group_id: selectedGroup.id, module: "/settings/users", view: selectedGroup.id === "1" },
        { id: "7", group_id: selectedGroup.id, module: "/settings/billing", view: selectedGroup.id === "1" },
        { id: "8", group_id: selectedGroup.id, module: "/analytics", view: selectedGroup.id !== "5" },
        { id: "9", group_id: selectedGroup.id, module: "/analytics/reports", view: selectedGroup.id !== "5" },
        {
          id: "10",
          group_id: selectedGroup.id,
          module: "/analytics/reports/monthly",
          view: selectedGroup.id !== "5",
        },
      ]
      setPermissions(mockPermissions)
    }
  }, [selectedGroup])

  const handleCreateGroup = () => {
    const newGroup: UserGroup = {
      id: `group-${Date.now()}`,
      name: "New Group",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: [],
      users: [],
    }
    setGroups([...groups, newGroup])
    setSelectedGroup(newGroup)

    // Log audit trail
    console.log(`Admin ${user?.username} created new group "${newGroup.name}" on ${new Date().toISOString()}`)

    setHasChanges(true)
  }

  const handleSelectGroup = (group: UserGroup) => {
    if (hasChanges) {
      setShowConfirmation(true)
      return
    }
    setSelectedGroup(group)
  }

  const handleUpdateGroupName = (name: string) => {
    const isSystemGroup = (groupName: string) => {
      return ["Super Admin", "Admin", "Manager"].includes(groupName)
    }

    if (selectedGroup && !isSystemGroup(selectedGroup.name)) {
      setSelectedGroup({ ...selectedGroup, name })
      setGroups(groups.map((g) => (g.id === selectedGroup.id ? { ...g, name } : g)))
      setHasChanges(true)
    }
  }

  const handleUpdatePermissions = (updatedPermissions: GroupPermission[]) => {
    setPermissions(updatedPermissions)
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Log audit trail
      console.log(
        `Admin ${user?.username} updated permissions for "${selectedGroup?.name}" group on ${new Date().toISOString()}`,
      )

      toast({
        title: "Success",
        description: `Permissions updated for ${selectedGroup?.name}`,
      })

      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmNavigation = (confirm: boolean) => {
    setShowConfirmation(false)
    if (confirm) {
      setHasChanges(false)
      // Navigate to the selected group
    }
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
        {/* Left Sidebar - User Groups */}
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

        {/* Main Panel - Permissions Editor */}
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

      {/* Confirmation Dialog */}
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
