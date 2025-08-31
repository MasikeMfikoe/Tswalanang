// app/admin/user-groups/components/UserAssignmentSection.tsx
"use client"

import { useEffect, useState } from "react"
import type { User } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client" // or your helper

interface Props {
  groupId: string
  isDefaultGroup: boolean
}

export default function UserAssignmentSection({ groupId, isDefaultGroup }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  useEffect(() => {
    ;(async () => {
      // Load assigned users for this group (adjust to your schema)
      const { data: assigned } = await supabase
        .from("group_users") // pivot table: group_id, user_id
        .select("user_profiles(id,user_id,customer_id,username,first_name,surname,full_name,email,role,department,page_access,created_at,updated_at)")
        .eq("group_id", groupId)

      const assignedList = (assigned || []).map((row: any) => mapProfileToUser(row.user_profiles)) as User[]

      // Load all users
      const { data: allProfiles } = await supabase
        .from("user_profiles")
        .select("id,user_id,customer_id,username,first_name,surname,full_name,email,role,department,page_access,created_at,updated_at")

      const allUsers = (allProfiles || []).map(mapProfileToUser) as User[]

      // Split into assigned / available
      const assignedIds = new Set(assignedList.map(u => u.id))
      const available = allUsers.filter(u => !assignedIds.has(u.id))

      setAssignedUsers(assignedList)
      setAvailableUsers(available)
    })()
  }, [groupId])

  const mapProfileToUser = (p: any): User => ({
    id: p.id,
    user_id: p.user_id,
    customer_id: p.customer_id,
    username: p.username ?? undefined,
    name: p.first_name ?? p.name ?? undefined,
    first_name: p.first_name ?? undefined,
    surname: p.surname ?? undefined,
    full_name: p.full_name ?? undefined,
    email: p.email, // REQUIRED
    role: p.role,
    department: p.department ?? undefined,
    pageAccess: p.page_access ? p.page_access.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
    page_access: p.page_access ?? undefined,
    created_at: p.created_at,
    updated_at: p.updated_at,
  })

  const handleAssignUser = async (user: User) => {
    setAssignedUsers(prev => [...prev, user])
    setAvailableUsers(prev => prev.filter(u => u.id !== user.id))
    await supabase.from("group_users").insert({ group_id: groupId, user_id: user.id })
  }

  const handleRemoveUser = async (userId: string) => {
    const userToRemove = assignedUsers.find(u => u.id === userId)
    if (!userToRemove) return
    setAssignedUsers(prev => prev.filter(u => u.id !== userId))
    setAvailableUsers(prev => [...prev, userToRemove])
    await supabase.from("group_users").delete().eq("group_id", groupId).eq("user_id", userId)
  }

  // ...keep the rest of your UI exactly the same (search, popover, list, badges) ...
}
