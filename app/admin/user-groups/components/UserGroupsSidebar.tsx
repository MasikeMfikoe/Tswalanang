"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserGroup {
  id: string
  name: string
}

interface UserGroupsSidebarProps {
  userGroups: UserGroup[]
  selectedGroupId: string | null
  onSelectGroup: (id: string | null) => void
  onNewGroup: () => void
}

export function UserGroupsSidebar({ userGroups, selectedGroupId, onSelectGroup, onNewGroup }: UserGroupsSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r bg-gray-100/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">User Groups</h3>
        <Button variant="ghost" size="icon" onClick={onNewGroup} aria-label="Create new group">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <div className="grid gap-2">
          {userGroups.map((group) => (
            <Button
              key={group.id}
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-2",
                selectedGroupId === group.id && "bg-gray-200 hover:bg-gray-200",
              )}
              onClick={() => onSelectGroup(group.id)}
            >
              <Users className="mr-2 h-4 w-4" />
              {group.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start px-3 py-2",
            selectedGroupId === "settings" && "bg-gray-200 hover:bg-gray-200",
          )}
          onClick={() => onSelectGroup("settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Group Settings
        </Button>
      </div>
    </div>
  )
}
