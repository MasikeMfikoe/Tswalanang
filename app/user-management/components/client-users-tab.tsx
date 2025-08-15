"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import CreateUserModal from "./create-user-modal"
import EditUserModal from "./edit-user-modal"

export function ClientUsersTab() {
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
    console.log("[v0] ClientUsersTab component mounted")
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] 🔄 Fetching users for client users tab...")
      const fetchedUsers = await getUsers()
      console.log("[v0] 📋 All users fetched:", fetchedUsers?.length || 0)

      if (fetchedUsers && Array.isArray(fetchedUsers)) {
        console.log(
          "[v0] 🔍 All user roles:",
          fetchedUsers.map((u) => ({ name: u.first_name || u.name, role: u.role })),
        )
      }

      if (!fetchedUsers || !Array.isArray(fetchedUsers)) {
        console.error("[v0] ❌ Invalid users data received:", fetchedUsers)
        setUsers([])
        return
      }

      const clientUsers = fetchedUsers.filter((user) => {
        if (!user || typeof user !== "object") return false
        const isClient = user.role === "client"
        console.log("[v0] 👤 User:", user.first_name || user.name, "Role:", user.role, "Is Client:", isClient)
        return isClient
      })

      console.log("[v0] 👥 Client users found:", clientUsers.length)
      console.log(
        "[v0] 📊 Client users breakdown:",
        clientUsers.map((u) => ({
          first_name: u.first_name,
          surname: u.surname,
          email: u.email,
          department: u.department,
        })),
      )

      setUsers(clientUsers)

      if (clientUsers.length === 0) {
        console.log("[v0] ⚠️ No client users found in Supabase")
      }
    } catch (error) {
      console.error("[v0] ❌ Error fetching client users:", error)
      setUsers([]) // Set empty array instead of keeping old data
      toast({
        title: "Error",
        description: "Failed to load client users from Supabase. Please check your database connection.",
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
        description: "Client user list refreshed from Supabase successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh client user list from Supabase.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      console.log("🚀 Creating client user:", userData)

      const success = await createUser({
        first_name: userData.first_name || userData.name!,
        surname: userData.surname!,
        email: userData.email!,
        role: "client",
        department: userData.department!, // Company name
        pageAccess: ["clientPortal", "shipmentTracker"],
        password: userData.password,
        sendWelcomeEmail: userData.sendWelcomeEmail,
      })

      if (success) {
        toast({
          title: "Success",
          description: `Client user ${userData.email} created successfully in Supabase!`,
        })
        setIsCreateModalOpen(false)

        // Refresh the list after a short delay to ensure data is saved
        setTimeout(() => {
          fetchUsers()
        }, 1000)
      }
    } catch (error) {
      console.error("❌ Error creating client user:", error)

      let errorMessage = "Failed to create client user in Supabase. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete client user ${userName} from Supabase?`)) {
      try {
        const success = await deleteUser(userId)
        if (success) {
          toast({
            title: "Success",
            description: `Client user ${userName} deleted from Supabase successfully!`,
          })
          fetchUsers() // Refresh the list
        } else {
          toast({
            title: "Error",
            description: "Failed to delete client user from Supabase. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Error deleting client user:", error)
        toast({
          title: "Error",
          description: "Failed to delete client user from Supabase. Please try again.",
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
          description: `Client user ${userData.email || selectedUser.email} updated in Supabase successfully!`,
        })
        setIsEditModalOpen(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: "Failed to update client user in Supabase. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error updating client user:", error)
      toast({
        title: "Error",
        description: "Failed to update client user in Supabase. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const filteredUsers = users.filter((user) => {
    if (!user || typeof user !== "object" || !user.id) return false

    const searchLower = searchTerm.toLowerCase()
    const firstName = user.first_name || user.name || ""
    const surname = user.surname || ""
    const email = user.email || ""
    const department = user.department || ""
    const username = user.username || ""

    return (
      firstName.toLowerCase().includes(searchLower) ||
      surname.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      department.toLowerCase().includes(searchLower) ||
      username.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Users</CardTitle>
          <CardDescription>Loading client users from Supabase database...</CardDescription>
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
            <CardTitle>Client Users</CardTitle>
            <CardDescription>
              Manage external client users with limited access ({users.length} users from Supabase)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh from Supabase
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search client users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Client User
          </Button>
        </div>

        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm ? "No client users found matching your search" : "No client users found in Supabase"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Client users have restricted access to tracking only their orders
              </p>
              {!searchTerm && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your client users should be stored in the 'user_profiles' table in Supabase
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Client User
                  </Button>
                </div>
              )}
            </div>
          ) : (
            filteredUsers
              .map((user) => {
                if (!user || typeof user !== "object" || !user.id) {
                  return null
                }

                const userName = `${user.first_name || user.name || ""} ${user.surname || ""}`.trim()
                const userEmail = user.email || "No email"
                const userUsername = user.username || "no-username"
                const userDepartment = user.department || "No company"

                const orderCount = Array.isArray(user.associatedOrders) ? user.associatedOrders.length : 0

                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{userName || "Unknown User"}</h3>
                          <p className="text-sm text-muted-foreground">{userEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            @{userUsername} • {userDepartment}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Client
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            Client Portal
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Shipment Tracker
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{orderCount} orders</div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" title="View Client Portal">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, userName)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
              .filter(Boolean)
          )}
        </div>

        {/* Create Client User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userType="client"
        />

        {/* Edit Client User Modal */}
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onUpdateUser={handleUpdateUser}
          user={selectedUser}
          userType="client"
        />
      </CardContent>
    </Card>
  )
}
