"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserIcon } from "lucide-react"
import { useState } from "react"

interface UserAssignmentSectionProps {
  groupId: string
  isDefaultGroup: boolean
}

export function UserAssignmentSection({ groupId, isDefaultGroup }: UserAssignmentSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - replace with actual data fetching
  const allUsers = [
    { id: "user1", name: "Alice Smith", email: "alice@example.com" },
    { id: "user2", name: "Bob Johnson", email: "bob@example.com" },
    { id: "user3", name: "Charlie Brown", email: "charlie@example.com" },
    { id: "user4", name: "Diana Prince", email: "diana@example.com" },
    { id: "user5", name: "Eve Adams", email: "eve@example.com" },
  ]

  const assignedUserIds = new Set(["user1", "user2"]) // Example assigned users

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUserAssignmentChange = (userId: string, isAssigned: boolean) => {
    console.log(`User ${userId} assigned to group ${groupId}: ${isAssigned}`)
    // Implement logic to update user group assignments in your data store
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <ScrollArea className="h-64 border rounded-md p-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users found.</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {!isDefaultGroup && (
                    <Checkbox
                      checked={assignedUserIds.has(user.id)}
                      onCheckedChange={(checked) => handleUserAssignmentChange(user.id, checked as boolean)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
