"use client"

import { useState, useEffect } from "react"
import { UserGroupsSidebar } from "./components/UserGroupsSidebar"
import { PermissionsEditor } from "./components/PermissionsEditor"
import { UserAssignmentSection } from "./components/UserAssignmentSection"
import { LivePreviewSection } from "./components/LivePreviewSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmationDialog } from "./components/ConfirmationDialog"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Users } from "lucide-react" // Import Users and PlusCircle

interface UserGroup {
  id: string
  name: string
  permissions: Record<string, boolean>
  assignedUserIds: string[]
}

interface User {
  id: string
  name: string
  email: string
}

const mockUserGroups: UserGroup[] = [
  {
    id: "1",
    name: "Administrators",
    permissions: {
      canViewDashboard: true,
      canManageUsers: true,
      canEditSettings: true,
      canViewDocuments: true,
      canManageOrders: true,
      canViewFinancials: true,
    },
    assignedUserIds: ["user1", "user2"],
  },
  {
    id: "2",
    name: "Operations Team",
    permissions: {
      canViewDashboard: true,
      canManageUsers: false,
      canEditSettings: false,
      canViewDocuments: true,
      canManageOrders: true,
      canViewFinancials: false,
    },
    assignedUserIds: ["user3"],
  },
  {
    id: "3",
    name: "Finance Department",
    permissions: {
      canViewDashboard: true,
      canManageUsers: false,
      canEditSettings: false,
      canViewDocuments: true,
      canManageOrders: false,
      canViewFinancials: true,
    },
    assignedUserIds: ["user4"],
  },
]

const mockUsers: User[] = [
  { id: "user1", name: "Alice Smith", email: "alice@example.com" },
  { id: "user2", name: "Bob Johnson", email: "bob@example.com" },
  { id: "user3", name: "Charlie Brown", email: "charlie@example.com" },
  { id: "user4", name: "Diana Prince", email: "diana@example.com" },
  { id: "user5", name: "Eve Adams", email: "eve@example.com" },
]

export default function UserGroupsPage() {
  const [userGroups, setUserGroups] = useState<UserGroup[]>(mockUserGroups)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null)
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedGroupId) {
      const group = userGroups.find((g) => g.id === selectedGroupId)
      if (group) {
        setEditingGroup({ ...group, assignedUserIds: [...group.assignedUserIds] }) // Deep copy assignedUserIds
        setIsNewGroup(false)
      }
    } else {
      setEditingGroup(null)
    }
  }, [selectedGroupId, userGroups])

  const handleNewGroup = () => {
    setSelectedGroupId(null)
    setEditingGroup({
      id: `new-${Date.now()}`,
      name: "New Group",
      permissions: {
        canViewDashboard: false,
        canManageUsers: false,
        canEditSettings: false,
        canViewDocuments: false,
        canManageOrders: false,
        canViewFinancials: false,
      },
      assignedUserIds: [],
    })
    setIsNewGroup(true)
  }

  const handleSaveGroup = () => {
    if (!editingGroup) return

    if (!editingGroup.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (isNewGroup) {
      setUserGroups([...userGroups, editingGroup])
      toast({
        title: "Success",
        description: `User group "${editingGroup.name}" created.`,
      })
    } else {
      setUserGroups(userGroups.map((g) => (g.id === editingGroup.id ? editingGroup : g)))
      toast({
        title: "Success",
        description: `User group "${editingGroup.name}" updated.`,
      })
    }
    setSelectedGroupId(editingGroup.id)
    setIsNewGroup(false)
  }

  const handleDeleteGroup = () => {
    if (editingGroup) {
      setUserGroups(userGroups.filter((g) => g.id !== editingGroup.id))
      setSelectedGroupId(null)
      setEditingGroup(null)
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: `User group "${editingGroup.name}" deleted.`,
      })
    }
  }

  const handlePermissionChange = (permission: string, value: boolean) => {
    if (editingGroup) {
      setEditingGroup({
        ...editingGroup,
        permissions: {
          ...editingGroup.permissions,
          [permission]: value,
        },
      })
    }
  }

  const handleUserAssignmentChange = (userId: string, isAssigned: boolean) => {
    if (editingGroup) {
      const updatedAssignedUserIds = isAssigned
        ? [...new Set([...editingGroup.assignedUserIds, userId])]
        : editingGroup.assignedUserIds.filter((id) => id !== userId)
      setEditingGroup({
        ...editingGroup,
        assignedUserIds: updatedAssignedUserIds,
      })
    }
  }

  return (
    <div className="flex h-screen w-full bg-gray-100/50 dark:bg-gray-950">
      <UserGroupsSidebar
        userGroups={userGroups}
        onSelectGroup={setSelectedGroupId}
        onNewGroup={handleNewGroup}
        selectedGroupId={selectedGroupId}
      />
      <main className="flex-1 p-6 overflow-auto">
        {editingGroup ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{isNewGroup ? "Create New User Group" : "Edit User Group"}</h1>
              <div className="flex gap-2">
                {!isNewGroup && (
                  <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    Delete Group
                  </Button>
                )}
                <Button onClick={handleSaveGroup}>Save Group</Button>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Input
                  placeholder="Group Name"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                />
                <PermissionsEditor permissions={editingGroup.permissions} onPermissionChange={handlePermissionChange} />
              </div>
              <LivePreviewSection
                groupName={editingGroup.name}
                permissions={editingGroup.permissions}
                assignedUsersCount={editingGroup.assignedUserIds.length}
              />
            </div>
            <UserAssignmentSection
              allUsers={mockUsers}
              assignedUserIds={new Set(editingGroup.assignedUserIds)}
              onUserAssignmentChange={handleUserAssignmentChange}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Users className="h-24 w-24 mb-4" />
            <p className="text-xl">Select a user group or create a new one to get started.</p>
            <Button onClick={handleNewGroup} className="mt-4">
              <PlusCircle className="h-5 w-5 mr-2" /> Create New Group
            </Button>
          </div>
        )}
      </main>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteGroup}
        onCancel={() => setShowDeleteDialog(false)}
        title={`Delete "${editingGroup?.name}"?`}
        description="Are you sure you want to delete this user group? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
