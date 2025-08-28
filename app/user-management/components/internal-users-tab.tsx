"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CreateUserModal from "./create-user-modal"
import { BulkImportModal } from "./bulk-import-modal"
import EditUserModal from "./edit-user-modal"
import type { User } from "@/types/auth"

interface InternalUser {
  id: string
  username: string
  email: string
  role: string
  first_name?: string
  surname?: string
  full_name?: string
  department?: string
}

export function InternalUsersTab() {
  const { toast } = useToast()
  const [users, setUsers] = useState<InternalUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<InternalUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)

  useEffect(() => {
    console.log("[v0] InternalUsersTab component mounted")
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const searchLower = searchTerm.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower),
      )
      setFilteredUsers(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchTerm, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] 🔄 Fetching internal users from API...")

      const response = await fetch("/api/users/list?type=internal")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const result = await response.json()

      console.log("[v0] 📋 Internal users fetched:", result.users?.length || 0)

      setUsers(result.users || [])
      console.log("[v0] ✅ Internal users loaded successfully")

      if ((result.users || []).length === 0) {
        console.log("[v0] ⚠️ No internal users found in Supabase")
      }
    } catch (error) {
      console.error("[v0] ❌ Error fetching internal users:", error)
      setUsers([])
      toast({
        title: "Error",
        description: "Failed to load internal users from Supabase.",
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
        description: "Internal user list refreshed successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh internal user list.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User> & { password?: string; sendWelcomeEmail?: boolean }) => {
    try {
      console.log("[v0] 🔄 Creating internal user:", userData.email)

      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user")
      }

      console.log("[v0] ✅ Internal user created successfully")

      toast({
        title: "Success",
        description: `Internal user ${userData.email} created successfully!`,
      })

      // Refresh the user list
      await fetchUsers()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("[v0] ❌ Error creating internal user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create internal user",
        variant: "destructive",
      })
    }
  }

  const handleBulkImport = async (users: any[]) => {
    try {
      console.log("[v0] 🔄 Starting bulk import of", users.length, "internal users")

      const response = await fetch("/api/users/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to import users")
      }

      console.log("[v0] ✅ Bulk import completed:", result.results)

      toast({
        title: "Import Complete",
        description: result.message,
      })

      // Refresh the user list
      await fetchUsers()
      setIsBulkImportModalOpen(false)
    } catch (error) {
      console.error("[v0] ❌ Error during bulk import:", error)
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import users",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: InternalUser) => {
    console.log("[v0] 📝 Opening edit modal for user:", user.email)
    const userForEdit = {
      ...user,
      name: user.first_name, // Map first_name to name for the modal
    }
    setSelectedUser(userForEdit)
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async (userData: any) => {
    try {
      console.log("[v0] 🔄 Updating internal user:", userData.email)

      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user")
      }

      console.log("[v0] ✅ Internal user updated successfully")

      toast({
        title: "Success",
        description: `User ${userData.email} updated successfully!`,
      })

      // Refresh the user list
      await fetchUsers()
      setIsEditModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("[v0] ❌ Error updating internal user:", error)
      throw error // Re-throw to let modal handle the error display
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Internal Users</CardTitle>
          <CardDescription>Loading internal users from Supabase...</CardDescription>
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
            <CardDescription>
              Manage internal organization users ({filteredUsers.length} of {users.length} users)
            </CardDescription>
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
              placeholder="Search by username or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Internal User
            </Button>
          </div>
        </div>

        {currentUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {searchTerm ? "No internal users found matching your search" : "No internal users found in Supabase"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Internal users have access to business operations and management functions
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Internal User
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role(s)</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                      {(user.first_name || user.surname) && (
                        <div className="text-sm text-muted-foreground">
                          {`${user.first_name || ""} ${user.surname || ""}`.trim()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || "No department"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
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
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
          userType="internal"
        />
        <BulkImportModal
          isOpen={isBulkImportModalOpen}
          onClose={() => setIsBulkImportModalOpen(false)}
          onImport={handleBulkImport}
        />
      </CardContent>
    </Card>
  )
}
