"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserAssignmentSectionProps {
  groupId: string
  isDefaultGroup: boolean
}

// Mock users for development
const mockUsers: User[] = [
  { id: "1", username: "john.doe", name: "John", surname: "Doe", role: "admin", department: "IT", pageAccess: [] },
  {
    id: "2",
    username: "jane.smith",
    name: "Jane",
    surname: "Smith",
    role: "manager",
    department: "Sales",
    pageAccess: [],
  },
  {
    id: "3",
    username: "bob.johnson",
    name: "Bob",
    surname: "Johnson",
    role: "employee",
    department: "Support",
    pageAccess: [],
  },
  {
    id: "4",
    username: "alice.williams",
    name: "Alice",
    surname: "Williams",
    role: "manager",
    department: "HR",
    pageAccess: [],
  },
  {
    id: "5",
    username: "charlie.brown",
    name: "Charlie",
    surname: "Brown",
    role: "employee",
    department: "Marketing",
    pageAccess: [],
  },
  {
    id: "6",
    username: "diana.prince",
    name: "Diana",
    surname: "Prince",
    role: "manager",
    department: "Operations",
    pageAccess: [],
  },
  {
    id: "7",
    username: "edward.stark",
    name: "Edward",
    surname: "Stark",
    role: "employee",
    department: "Finance",
    pageAccess: [],
  },
]

export default function UserAssignmentSection({ groupId, isDefaultGroup }: UserAssignmentSectionProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, we'll use mock data
    const mockAssignedUsers = mockUsers.filter((_, index) => index % 3 === 0)
    setAssignedUsers(mockAssignedUsers)
    setAvailableUsers(mockUsers.filter((user) => !mockAssignedUsers.some((u) => u.id === user.id)))
  }, [groupId])

  const handleAssignUser = (user: User) => {
    setAssignedUsers([...assignedUsers, user])
    setAvailableUsers(availableUsers.filter((u) => u.id !== user.id))
    setOpen(false)
  }

  const handleRemoveUser = (userId: string) => {
    const userToRemove = assignedUsers.find((u) => u.id === userId)
    if (userToRemove) {
      setAssignedUsers(assignedUsers.filter((u) => u.id !== userId))
      setAvailableUsers([...availableUsers, userToRemove])
    }
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      `${user.name} ${user.surname}`.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="assign-users">Assign Users to Group</Label>
        <div className="flex mt-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
                disabled={isDefaultGroup}
              >
                <span>Select users...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              side="bottom"
              sideOffset={5}
              alignOffset={0}
              avoidCollisions={false}
            >
              <Command>
                <CommandInput placeholder="Search users..." value={search} onValueChange={setSearch} />
                <CommandList>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-72">
                      {filteredUsers.map((user) => (
                        <CommandItem key={user.id} value={user.id} onSelect={() => handleAssignUser(user)}>
                          <div className="flex flex-col">
                            <span>
                              {user.name} {user.surname}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{user.username} • {user.department}
                            </span>
                          </div>
                          <Check className="ml-auto h-4 w-4 opacity-0" />
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label>Assigned Users</Label>
        <div className="mt-1.5 border rounded-md p-2 min-h-[100px]">
          {assignedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <UserPlus className="h-8 w-8 mb-2" />
              <p>No users assigned to this group</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedUsers.map((user) => (
                <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                  {user.name} {user.surname}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={isDefaultGroup}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        {isDefaultGroup && (
          <p className="text-sm text-muted-foreground mt-2">
            Default groups automatically assign permissions based on user roles. Manual user assignment is disabled.
          </p>
        )}
      </div>
    </div>
  )
}
