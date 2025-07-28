"use client"

import type { UserGroup } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Shield, ShieldAlert, Users } from "lucide-react"

interface UserGroupsSidebarProps {
  groups: UserGroup[]
  selectedGroup: UserGroup | null
  onSelectGroup: (group: UserGroup) => void
}

export default function UserGroupsSidebar({ groups, selectedGroup, onSelectGroup }: UserGroupsSidebarProps) {
  return (
    <div className="space-y-1">
      {groups.map((group) => (
        <Button
          key={group.id}
          variant="ghost"
          className={cn("w-full justify-start", selectedGroup?.id === group.id && "bg-muted font-medium")}
          onClick={() => onSelectGroup(group)}
        >
          {group.name === "Super Admin" ? (
            <ShieldAlert className="mr-2 h-4 w-4" />
          ) : group.isDefault ? (
            <Shield className="mr-2 h-4 w-4" />
          ) : (
            <Users className="mr-2 h-4 w-4" />
          )}
          <span className="flex-1 text-left">{group.name}</span>
          {group.isDefault && (
            <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded text-muted-foreground">
              Default
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}
