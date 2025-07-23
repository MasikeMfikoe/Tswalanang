"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  name: string
  email: string
}

interface UserAssignmentSectionProps {
  groupId: string
  allUsers: User[]
  assignedUserIds: Set<string>
  onUserAssignmentChange: (userId: string, isAssigned: boolean) => void
  isDefaultGroup?: boolean
}

const mockUsers: User[] = [
  { id: "user1", name: "Alice Smith", email: "alice@example.com" },
  { id: "user2", name: "Bob Johnson", email: "bob@example.com" },
  { id: "user3", name: "Charlie Brown", email: "charlie@example.com" },
  { id: "user4", name: "Diana Prince", email: "diana@example.com" },
  { id: "user5", name: "Eve Adams", email: "eve@example.com" },
]

export function UserAssignmentSection({
  groupId,
  allUsers = mockUsers,
  assignedUserIds,
  onUserAssignmentChange,
  isDefaultGroup = false,
}: UserAssignmentSectionProps) {
  const handleCheckboxChange = (userId: string, isChecked: boolean) => {
    onUserAssignmentChange(userId, isChecked)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Assign Users to Group</h3>
      <p className="text-sm text-gray-500">Select users to assign to this group.</p>
      <div className="rounded-md border p-4">
        {allUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-2">
            <Checkbox
              id={`user-${user.id}`}
              checked={assignedUserIds.has(user.id)}
              onCheckedChange={(checked) => handleCheckboxChange(user.id, !!checked)}
              disabled={isDefaultGroup}
            />
            <Label htmlFor={`user-${user.id}`} className="flex items-center space-x-2">
              <span>{user.name}</span>
              <span className="text-gray-500 text-sm">{user.email}</span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserAssignmentSection
