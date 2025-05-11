"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type { User, UserRole } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const availablePages = [
  "dashboard",
  "orders",
  "documents",
  "deliveries",
  "customers",
  "currency",
  "containerTracking",
  "auditTrail",
]

const UserManagement: React.FC = () => {
  const { getUsers, createUser, updateUser, deleteUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<Partial<User & { pageAccess: string[] }>>({
    name: "",
    surname: "",
    password: "",
    role: "employee",
    department: "",
    pageAccess: [],
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const fetchedUsers = await getUsers()
    setUsers(fetchedUsers)
  }

  const handleCreateUser = async () => {
    if (newUser.name && newUser.surname && newUser.password) {
      await createUser(newUser as Omit<User, "id" | "username">)
      setNewUser({ name: "", surname: "", password: "", role: "employee", department: "", pageAccess: [] })
      fetchUsers()
    }
  }

  const handleUpdateUser = async () => {
    if (editingUser) {
      await updateUser(editingUser)
      setEditingUser(null)
      fetchUsers()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId)
    fetchUsers()
  }

  const handlePageAccessChange = (page: string) => {
    setNewUser((prev) => ({
      ...prev,
      pageAccess: prev.pageAccess?.includes(page)
        ? prev.pageAccess.filter((p) => p !== page)
        : [...(prev.pageAccess || []), page],
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <Dialog>
        <DialogTrigger>
          <Button className="mb-4" type="button">
            Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              placeholder="Surname"
              value={newUser.surname}
              onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Input
              placeholder="Department"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            />
            <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label className="text-sm font-medium mb-2 block">Page Access</Label>
              <div className="space-y-2">
                {availablePages.map((page) => (
                  <div key={page} className="flex items-center">
                    <Checkbox
                      id={`page-${page}`}
                      checked={newUser.pageAccess?.includes(page)}
                      onCheckedChange={() => handlePageAccessChange(page)}
                    />
                    <Label htmlFor={`page-${page}`} className="ml-2">
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Surname</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.surname}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2" onClick={() => setEditingUser(user)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <Input
                placeholder="Surname"
                value={editingUser.surname}
                onChange={(e) => setEditingUser({ ...editingUser, surname: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={editingUser.password}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
              />
              <Input
                placeholder="Department"
                value={editingUser.department}
                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
              />
              <Select
                value={editingUser.role}
                onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Access</Label>
                <div className="space-y-2">
                  {availablePages.map((page) => (
                    <div key={page} className="flex items-center">
                      <Checkbox
                        id={`edit-page-${page}`}
                        checked={editingUser.pageAccess?.includes(page)}
                        onCheckedChange={() => {
                          setEditingUser((prev) => ({
                            ...prev,
                            pageAccess: prev.pageAccess?.includes(page)
                              ? prev.pageAccess.filter((p) => p !== page)
                              : [...(prev.pageAccess || []), page],
                          }))
                        }}
                      />
                      <Label htmlFor={`edit-page-${page}`} className="ml-2">
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default UserManagement
