"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Users } from "lucide-react"

interface UserGroup {
  id: string
  name: string
}

interface UserGroupsSidebarProps {
  userGroups: UserGroup[]
  onSelectGroup: (groupId: string) => void
  onNewGroup: () => void
  selectedGroupId: string | null
}

export function UserGroupsSidebar({ userGroups, onSelectGroup, onNewGroup, selectedGroupId }: UserGroupsSidebarProps) {
  return (
    <div className="w-64 border-r bg-gray-50/50 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> User Groups
        </h2>
        <Button variant="ghost" size="icon" onClick={onNewGroup} aria-label="Create new group">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-2">
          {userGroups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroupId === group.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectGroup(group.id)}
            >
              {group.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
