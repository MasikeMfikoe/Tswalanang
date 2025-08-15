"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import CreateUserModal from "./create-user-modal"
import EditUserModal from "./edit-user-modal"

function SafeUserRenderer({
  user,
  onEdit,
  onDelete,
}: { user: User; onEdit: (user: User) => void; onDelete: (id: string, name: string) => void }) {
  try {
    if (!user || typeof user !== "object" || !user.id) {
      return null
    }

    const safeFirstName = String(user.first_name || user.name || "")
    const safeSurname = String(user.surname || "")
    const safeEmail = String(user.email || "No email")
    const safeUsername = String(user.username || "no-username")
    const safeRole = String(user.role || "employee")
    const safeDepartment = String(user.department || "No department")

    let safePageAccess: string[] = []
    try {
      if (Array.isArray(user.pageAccess)) {
        safePageAccess = user.pageAccess.filter((page) => typeof page === "string" && page.length > 0)
      }
    } catch {
      safePageAccess = []
    }

    const getRoleBadgeVariant = (role: string) => {
      switch (role) {
        case "admin":
          return "default"
        case "manager":
          return "secondary"
        case "employee":
          return "outline"
        default:
          return "outline"
      }
    }

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-medium">{`${safeFirstName} ${safeSurname}`.trim() || "Unnamed User"}</h3>
              <p className="text-sm text-muted-foreground">{safeEmail}</p>
              <p className="text-xs text-muted-foreground">@{safeUsername}</p>
            </div>
            <Badge variant={getRoleBadgeVariant(safeRole)}>
              {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
            </Badge>
            <div className="text-sm text-muted-foreground">{safeDepartment}</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {safePageAccess.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {safePageAccess.slice(0, 3).map((page, index) => (
                  <Badge key={`${page}-${index}`} variant="outline" className="text-xs">
                    {page}
                  </Badge>
                ))}
                {safePageAccess.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{safePageAccess.length - 3} more
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">No access</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user.id, `${safeFirstName} ${safeSurname}`.trim() || "Unnamed User")}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error rendering user:", user?.id || "unknown", error)
    return null
  }
}

export function InternalUsersTab() {
  const { getUsers, createUser, deleteUser, updateUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const fetchedUsers = await getUsers()

      if (!Array.isArray(fetchedUsers)) {
        console.error("❌ Invalid users data received:", fetchedUsers)
        setUsers([])
        return
      }

      const validUsers = fetchedUsers.filter(
        (user) => user && typeof user === "object" && user.id && user.role !== "client",
      )

      setUsers(validUsers)
    } catch (error) {
      console.error("❌ Error fetching users:", error)
      setUsers([])
      toast({
        title: "Error",
        description: "Failed to load users from Supabase.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchUsers()
      toast({
        title: "Success",
        description: "User list refreshed successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh user list.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User> & { password?: string; sendWelcomeEmail?: boolean }) => {
    try {
      const success = await createUser({
        first_name: userData.first_name || userData.name!,
        surname: userData.surname!,
        email: userData.email!,
        role: userData.role!,
        department: userData.department!,
        pageAccess: userData.pageAccess || getDefaultPageAccess(userData.role!),
        password: userData.password,
        sendWelcomeEmail: userData.sendWelcomeEmail,
      })

      if (success) {
        toast({
          title: "Success",
          description: `User ${userData.email} created successfully!`,
        })
        setIsCreateModalOpen(false)
        setTimeout(() => fetchUsers(), 1000)
      }
    } catch (error) {
      console.error("❌ Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user ${userName}?`)) {
      try {
        const success = await deleteUser(userId)
        if (success) {
          toast({
            title: "Success",
            description: `User ${userName} deleted successfully!`,
          })
          fetchUsers()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser) return

    try {
      const success = await updateUser(selectedUser.id, userData)
      if (success) {
        toast({
          title: "Success",
          description: `User updated successfully!`,
        })
        setIsEditModalOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Failed to update user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getDefaultPageAccess = (role: string): string[] => {
    switch (role) {
      case "admin":
        return [
          "dashboard",
          "orders",
          "customers",
          "documents",
          "deliveries",
          "courierOrders",
          "shipmentTracker",
          "userManagement",
        ]
      case "manager":
        return ["dashboard", "orders", "customers", "deliveries", "courierOrders"]
      case "employee":
        return ["dashboard", "orders"]
      default:
        return ["dashboard"]
    }
  }

  const getFilteredUsers = () => {
    try {
      if (!Array.isArray(users)) return []

      return users.filter((user) => {
        if (!user || typeof user !== "object" || !user.id) return false

        const searchLower = String(searchTerm || "").toLowerCase()
        if (!searchLower) return true

        const searchableFields = [
          String(user.first_name || user.name || ""),
          String(user.surname || ""),
          String(user.email || ""),
          String(user.department || ""),
          String(user.username || ""),
        ]

        return searchableFields.some((field) => field.toLowerCase().includes(searchLower))
      })
    } catch (error) {
      console.error("[v0] Error filtering users:", error)
      return []
    }
  }

  const filteredUsers = getFilteredUsers()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Internal Users</CardTitle>
          <CardDescription>Loading users from database...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Internal Users</CardTitle>
            <CardDescription>Manage users within your organization ({users.length} users)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm ? "No users found matching your search" : "No internal users found"}
              </p>
              {!searchTerm && (
                <div className="mt-4">
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First User
                  </Button>
                </div>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <SafeUserRenderer key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            ))
          )}
        </div>

        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userType="internal"
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onUpdateUser={handleUpdateUser}
          user={selectedUser}
          userType="internal"
        />
      </CardContent>
    </Card>
  )
}
