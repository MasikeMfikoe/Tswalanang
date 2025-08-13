"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export default function TrackingUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { createUser, getUsers } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    username: "trackinguser1",
    password: "Tracking123!",
    name: "Tracking",
    surname: "User",
    company: "Client",
    email: "tracking@example.com",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // In a real app, you would filter users by role
      if (typeof getUsers === "function") {
        const allUsers = await getUsers()
        const trackingUsers = allUsers.filter(
          (user) => user.role === "guest" && user.pageAccess?.includes("shipmentTracker"),
        )
        setUsers(trackingUsers)
      } else {
        console.error("getUsers function is not available in AuthContext")
        toast({
          title: "Using mock data",
          description: "Using mock tracking users data since getUsers is not available",
          variant: "default",
        })

        // Provide mock data for development/testing
        setUsers([
          {
            id: "mock-tracking-1",
            username: "trackinguser1",
            name: "Tracking",
            surname: "User One",
            role: "guest",
            department: "Client A",
            pageAccess: ["shipmentTracker"],
          },
          {
            id: "mock-tracking-2",
            username: "trackinguser2",
            name: "Tracking",
            surname: "User Two",
            role: "guest",
            department: "Client B",
            pageAccess: ["shipmentTracker"],
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching tracking users:", error)
      toast({
        title: "Error",
        description: "Failed to load tracking users",
        variant: "destructive",
      })

      // Set empty array on error
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUser.username || !newUser.password || !newUser.name || !newUser.surname) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a tracking-only user
      await createUser({
        name: newUser.name,
        surname: newUser.surname,
        role: "guest", // Using guest role with limited access
        department: newUser.company || "Client",
        pageAccess: ["shipmentTracker"], // Only access to shipment tracker
        email: newUser.email,
        password: newUser.password, // Now properly handled by createUser function
        sendWelcomeEmail: false, // Don't send welcome email for tracking users
      })

      toast({
        title: "Success",
        description: "Tracking user created successfully",
      })

      // Reset form and refresh user list
      setNewUser({
        username: "trackinguser1",
        password: "Tracking123!",
        name: "Tracking",
        surname: "User",
        company: "Client",
        email: "tracking@example.com",
      })

      fetchUsers()
    } catch (error) {
      console.error("Error creating tracking user:", error)
      toast({
        title: "Error",
        description: "Failed to create tracking user",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tracking Users Management</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Tracking User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name *</Label>
                  <Input id="name" name="name" value={newUser.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name *</Label>
                  <Input id="surname" name="surname" value={newUser.surname} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" value={newUser.company} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={newUser.email} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" value={newUser.username} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Tracking User
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Tracking Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No tracking users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.name} {user.surname}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <p>
          To test the app, use the following credentials:
          <br />
          Username: <span className="font-bold">trackinguser1</span>
          <br />
          Password: <span className="font-bold">Tracking123!</span>
        </p>
      </div>
    </div>
  )
}
