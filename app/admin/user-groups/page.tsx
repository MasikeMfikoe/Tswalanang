"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserGroupsSidebar } from "./components/UserGroupsSidebar"
import { PermissionsEditor } from "./components/PermissionsEditor"
import { UserAssignmentSection } from "./components/UserAssignmentSection"
import { LivePreviewSection } from "./components/LivePreviewSection"
import { ConfirmationDialog } from "./components/ConfirmationDialog"
import { useToast } from "@/components/ui/use-toast" // Assuming this is the correct path
import { Users, PlusCircle } from "react-feather" // Importing undeclared variables

interface UserGroup {
  id: string
  name: string
  permissions: Record<string, boolean>
  assignedUsers: string[]
}

// Mock Data - Replace with actual API calls
const mockUserGroups: UserGroup[] = [
  {
    id: "1",
    name: "Administrators",
    permissions: {
      canViewOrders: true,
      canCreateOrders: true,
      canEditOrders: true,
      canDeleteOrders: true,
      canViewCustomers: true,
      canCreateCustomers: true,
      canEditCustomers: true,
      canDeleteCustomers: true,
      canViewEstimates: true,
      canCreateEstimates: true,
      canEditEstimates: true,
      canDeleteEstimates: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canDeleteDocuments: true,
      canManageUsers: true,
      canManageUserGroups: true,
      canAccessSettings: true,
      canViewTracking: true,
      canInitiateTracking: true,
    },
    assignedUsers: ["admin@example.com", "john.doe@example.com"],
  },
  {
    id: "2",
    name: "Sales Team",
    permissions: {
      canViewOrders: true,
      canCreateOrders: true,
      canEditOrders: true,
      canViewCustomers: true,
      canCreateCustomers: true,
      canEditCustomers: true,
      canViewEstimates: true,
      canCreateEstimates: true,
      canEditEstimates: true,
      canViewDocuments: true,
      canViewTracking: true,
    },
    assignedUsers: ["jane.smith@example.com"],
  },
  {
    id: "3",
    name: "Viewers",
    permissions: {
      canViewOrders: true,
      canViewCustomers: true,
      canViewEstimates: true,
      canViewDocuments: true,
      canViewTracking: true,
    },
    assignedUsers: ["guest@example.com"],
  },
]

const allMockUsers = [
  { value: "admin@example.com", label: "Admin User" },
  { value: "john.doe@example.com", label: "John Doe" },
  { value: "jane.smith@example.com", label: "Jane Smith" },
  { value: "guest@example.com", label: "Guest User" },
  { value: "new.user@example.com", label: "New User" },
]

export default function UserGroupsPage() {
  const [userGroups, setUserGroups] = useState<UserGroup[]>(mockUserGroups)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [currentGroup, setCurrentGroup] = useState<UserGroup | null>(null)
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedGroupId) {
      const group = userGroups.find((g) => g.id === selectedGroupId)
      if (group) {
        setCurrentGroup({ ...group }) // Deep copy to allow editing
        setIsNewGroup(false)
      }
    } else {
      setCurrentGroup(null)
      setIsNewGroup(false)
    }
  }, [selectedGroupId, userGroups])

  const handleNewGroup = () => {
    setSelectedGroupId(null)
    setCurrentGroup({
      id: `new-${Date.now()}`, // Temporary ID
      name: "New Group",
      permissions: {},
      assignedUsers: [],
    })
    setIsNewGroup(true)
  }

  const handleSaveGroup = () => {
    if (!currentGroup) return

    if (!currentGroup.name.trim()) {
      toast({
        title: "Error",
        description: "Group name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (isNewGroup) {
      const newGroup: UserGroup = {
        ...currentGroup,
        id: String(userGroups.length + 1), // Assign a proper ID for mock
      }
      setUserGroups((prev) => [...prev, newGroup])
      setSelectedGroupId(newGroup.id)
      setIsNewGroup(false)
      toast({
        title: "Success",
        description: `User group "${newGroup.name}" created.`,
      })
    } else {
      setUserGroups((prev) => prev.map((g) => (g.id === currentGroup.id ? { ...currentGroup } : g)))
      toast({
        title: "Success",
        description: `User group "${currentGroup.name}" updated.`,
      })
    }
  }

  const handleDeleteGroup = () => {
    if (!currentGroup) return
    setUserGroups((prev) => prev.filter((g) => g.id !== currentGroup.id))
    setSelectedGroupId(null)
    setCurrentGroup(null)
    setShowDeleteConfirm(false)
    toast({
      title: "Success",
      description: `User group "${currentGroup.name}" deleted.`,
    })
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (currentGroup) {
      setCurrentGroup((prev) => ({
        ...(prev as UserGroup),
        permissions: {
          ...(prev as UserGroup).permissions,
          [permission]: checked,
        },
      }))
    }
  }

  const handleAssignedUsersChange = (users: string[]) => {
    if (currentGroup) {
      setCurrentGroup((prev) => ({
        ...(prev as UserGroup),
        assignedUsers: users,
      }))
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="User Groups" description="Manage user roles and permissions." />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-180px)]">
        <UserGroupsSidebar
          userGroups={userGroups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onNewGroup={handleNewGroup}
        />

        <div className="flex flex-col gap-6 overflow-auto pb-4">
          {currentGroup ? (
            <>
              <Input
                placeholder="Group Name"
                value={currentGroup.name}
                onChange={(e) => setCurrentGroup((prev) => ({ ...(prev as UserGroup), name: e.target.value }))}
                className="text-2xl font-bold"
              />
              <PermissionsEditor permissions={currentGroup.permissions} onPermissionChange={handlePermissionChange} />
              <UserAssignmentSection
                allUsers={allMockUsers}
                assignedUsers={currentGroup.assignedUsers}
                onAssignedUsersChange={handleAssignedUsersChange}
              />
              <LivePreviewSection
                groupName={currentGroup.name}
                permissions={currentGroup.permissions}
                assignedUsers={currentGroup.assignedUsers}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedGroupId(null)}>
                  Cancel
                </Button>
                {!isNewGroup && (
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Group
                  </Button>
                )}
                <Button onClick={handleSaveGroup}>Save Group</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Users className="h-16 w-16 mb-4" />
              <p className="text-lg">Select a group or create a new one to manage permissions.</p>
              <Button onClick={handleNewGroup} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Group
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteGroup}
        onCancel={() => setShowDeleteConfirm(false)}
        title={`Delete "${currentGroup?.name}"?`}
        description="Are you sure you want to delete this user group? This action cannot be undone."
      />
    </div>
  )
}
