"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { User, UserGroup } from "@/types/auth"
import CreateUserModal from "./components/CreateUserModal"
import { useToast } from "@/components/ui/use-toast"

export default function AdminUsersPage() {
  const router = useRouter()
  const { getUsers } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch users and groups only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Mock data for users
        const mockUsers: User[] = [
          {
            id: "1",
            name: "John",
            surname: "Doe",
            email: "john.doe@example.com",
            username: "john.doe",
            department: "Sales",
            role: "manager",
            pageAccess: [],
          },
          {
            id: "2",
            name: "Jane",
            surname: "Smith",
            email: "jane.smith@example.com",
            username: "jane.smith",
            department: "HR",
            role: "employee",
            pageAccess: [],
          },
          {
            id: "3",
            name: "Admin",
            surname: "User",
            email: "admin@example.com",
            username: "admin",
            department: "Super Admin",
            role: "admin",
            pageAccess: [],
          },
        ]

        setUsers(mockUsers)
        setFilteredUsers(mockUsers)

        // Mock data for user groups
        const groups: UserGroup[] = [
          { id: "1", name: "Super Admin", isDefault: true, createdAt: new Date().toISOString() },
          { id: "2", name: "Sales", isDefault: false, createdAt: new Date().toISOString() },
          { id: "3", name: "HR", isDefault: false, createdAt: new Date().toISOString() },
          { id: "4", name: "Support", isDefault: false, createdAt: new Date().toISOString() },
          { id: "5", name: "Engineering", isDefault: false, createdAt: new Date().toISOString() },
          { id: "6", name: "Guest", isDefault: true, createdAt: new Date().toISOString() },
        ]
        setUserGroups(groups)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast]) // Only depend on toast

  // Filter users when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.surname?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.department?.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleCreateUser = useCallback(
    async (newUser: Partial<User>) => {
      try {
        // In a real implementation, this would call an API
        // For now, we'll just add the user to the local state
        const createdUser = {
          ...newUser,
          id: `user-${Date.now()}`,
          username: newUser.email || `user-${Date.now()}`,
          pageAccess: [],
        } as User

        setUsers((prev) => [...prev, createdUser])
        setIsCreateModalOpen(false)

        toast({
          title: "Success",
          description: `User ${newUser.email} created and added to ${newUser.department || "Unassigned"}!`,
        })
      } catch (error) {
        console.error("Error creating user:", error)
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Function to get group badge color based on group name
  const getGroupColor = (groupName = "") => {
    const colorMap: Record<string, string> = {
      "Super Admin": "bg-red-500",
      Admin: "bg-red-500",
      Sales: "bg-blue-500",
      HR: "bg-purple-500",
      Support: "bg-green-500",
      Engineering: "bg-amber-500",
      Guest: "bg-gray-500",
    }

    return colorMap[groupName] || "bg-gray-500"
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/tracking-users")}>
            Manage Tracking Users
          </Button>
        </div>
      </div>

      {/* Search and Create User Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create New User</Button>
      </div>

      {/* Users Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.name || ""} ${user.surname || ""}`}</TableCell>
                  <TableCell>{user.email || user.username}</TableCell>
                  <TableCell>
                    <Badge className={`${getGroupColor(user.department)}`}>{user.department || "Unassigned"}</Badge>
                  </TableCell>
                  <TableCell>{user.department || "Unassigned"}</TableCell>
                  <TableCell>{user.role || "employee"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userGroups={userGroups}
          existingEmails={users.map((user) => user.email || user.username || "")}
        />
      )}
    </div>
  )
}
