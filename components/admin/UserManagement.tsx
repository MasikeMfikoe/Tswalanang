"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle, Edit, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CreateUserModal } from "@/app/admin/users/components/CreateUserModal" // Assuming this path
import { ConfirmationDialog } from "@/app/admin/user-groups/components/ConfirmationDialog" // Reusing this component

interface User {
  id: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
}

// Mock data for users
const mockUsers: User[] = [
  { id: "usr_001", email: "admin@example.com", role: "admin", status: "active", lastLogin: "2024-07-19" },
  { id: "usr_002", email: "john.doe@example.com", role: "editor", status: "active", lastLogin: "2024-07-18" },
  { id: "usr_003", email: "jane.smith@example.com", role: "viewer", status: "active", lastLogin: "2024-07-19" },
  { id: "usr_004", email: "inactive@example.com", role: "viewer", status: "inactive", lastLogin: "2024-07-10" },
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      let filteredUsers = mockUsers

      if (filterRole !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.role === filterRole)
      }
      if (filterStatus !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.status === filterStatus)
      }
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase()
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.email.toLowerCase().includes(lowerCaseQuery) ||
            user.role.toLowerCase().includes(lowerCaseQuery) ||
            user.id.toLowerCase().includes(lowerCaseQuery),
        )
      }
      setUsers(filteredUsers)
    } catch (err) {
      setError("Failed to fetch users.")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filterRole, filterStatus, searchQuery])

  const handleCreateUser = (newUser: Omit<User, "id" | "lastLogin" | "status">) => {
    // Simulate API call to create user
    const createdUser: User = {
      ...newUser,
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      lastLogin: new Date().toISOString().split("T")[0],
      status: "active", // New users are active by default
    }
    setUsers((prev) => [...prev, createdUser])
    toast({
      title: "User Created",
      description: `User ${newUser.email} has been created.`,
      variant: "success",
    })
    setIsCreateModalOpen(false)
  }

  const handleEditUser = (user: User) => {
    // In a real app, this would open an edit modal pre-filled with user data
    toast({
      title: "Edit User",
      description: `Editing user ${user.email}. (Functionality to be implemented)`,
    })
    console.log("Edit user:", user)
  }

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const handleDeleteUser = () => {
    if (userToDelete) {
      // Simulate API call to delete user
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      toast({
        title: "User Deleted",
        description: `User ${userToDelete.email} has been deleted.`,
        variant: "success",
      })
      setUserToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading users...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchUsers} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="col-span-full md:col-span-1"
          />
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {users.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No users found for the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDeleteUser(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteUser}
        onCancel={() => setShowDeleteConfirm(false)}
        title={`Delete user "${userToDelete?.email}"?`}
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </Card>
  )
}
