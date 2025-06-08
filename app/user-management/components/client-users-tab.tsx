"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import CreateUserModal from "./create-user-modal"

export function ClientUsersTab() {
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
      console.log("🔄 Fetching users...")
      const fetchedUsers = await getUsers()
      console.log("📋 All users:", fetchedUsers)

      // Filter only client users
      const clientUsers = fetchedUsers.filter((user) => user.role === "client")
      console.log("👥 Client users:", clientUsers)

      setUsers(clientUsers)
    } catch (error) {
      console.error("❌ Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load client users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      console.log("🚀 Creating client user:", userData)

      const success = await createUser({
        name: userData.name!,
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
          description: `Client user ${userData.email} created successfully!`,
        })
        setIsCreateModalOpen(false)

        // Refresh the list after a short delay to ensure data is saved
        setTimeout(() => {
          fetchUsers()
        }, 1000)
      } else {
        toast({
          title: "Error",
          description: "Failed to create client user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error creating client user:", error)
      toast({
        title: "Error",
        description: "Failed to create client user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete client user ${userName}?`)) {
      try {
        const success = await deleteUser(userId)
        if (success) {
          toast({
            title: "Success",
            description: `Client user ${userName} deleted successfully!`,
          })
          fetchUsers() // Refresh the list
        } else {
          toast({
            title: "Error",
            description: "Failed to delete client user. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Error deleting client user:", error)
        toast({
          title: "Error",
          description: "Failed to delete client user. Please try again.",
          variant: "destructive",
        })
      }
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Users</CardTitle>
          <CardDescription>Loading client users...</CardDescription>
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
        <CardTitle>Client Users</CardTitle>
        <CardDescription>Manage external client users with limited access</CardDescription>
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
                {searchTerm ? "No client users found matching your search" : "No client users found"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Client users have restricted access to tracking only their orders
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Client User
                </Button>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{`${user.name} ${user.surname}`}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.department}</p>
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
                  <div className="text-sm text-muted-foreground">{user.associatedOrders?.length || 0} orders</div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" title="View Client Portal">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
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

        {/* Create Client User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userType="client"
        />
      </CardContent>
    </Card>
  )
}
