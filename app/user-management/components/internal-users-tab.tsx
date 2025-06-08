"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import CreateUserModal from "./create-user-modal"

export function InternalUsersTab() {
  const { getUsers, createUser, deleteUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const fetchedUsers = await getUsers()
      // Filter out client users (role === "client")
      const internalUsers = fetchedUsers.filter((user) => user.role !== "client")
      setUsers(internalUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const success = await createUser({
        name: userData.name!,
        surname: userData.surname!,
        email: userData.email!,
        role: userData.role!,
        department: userData.department!,
        pageAccess: userData.pageAccess || getDefaultPageAccess(userData.role!),
      })

      if (success) {
        toast({
          title: "Success",
          description: `User ${userData.email} created successfully!`,
        })
        setIsCreateModalOpen(false)
        fetchUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
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
          fetchUsers() // Refresh the list
        } else {
          toast({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Internal Users</CardTitle>
          <CardDescription>Loading users...</CardDescription>
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
        <CardTitle>Internal Users</CardTitle>
        <CardDescription>Manage users within your organization</CardDescription>
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
              onChange={(e) => handleSearch(e.target.value)}
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
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{`${user.name} ${user.surname}`}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">{user.department}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.pageAccess && user.pageAccess.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.pageAccess.slice(0, 3).map((page) => (
                          <Badge key={page} variant="outline" className="text-xs">
                            {page}
                          </Badge>
                        ))}
                        {user.pageAccess.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.pageAccess.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No access</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, `${user.name} ${user.surname}`)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userType="internal"
        />
      </CardContent>
    </Card>
  )
}
