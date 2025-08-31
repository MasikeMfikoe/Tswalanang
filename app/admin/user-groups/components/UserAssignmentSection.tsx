// app/admin/user-groups/components/UserAssignmentSection.tsx
"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";

interface UserAssignmentSectionProps {
  groupId: string;
  isDefaultGroup: boolean;
}

const PROFILE_SELECT = `
  id, user_id, customer_id,
  username, first_name, surname, full_name, email, role, department,
  page_access, created_at, updated_at
`;

const mapProfileToUser = (p: any): User => ({
  id: p.id,
  user_id: p.user_id,
  customer_id: p.customer_id ?? undefined,
  username: p.username ?? undefined,
  name: p.first_name ?? p.name ?? undefined,
  first_name: p.first_name ?? undefined,
  surname: p.surname ?? undefined,
  full_name: p.full_name ?? undefined,
  email: p.email,             // required
  role: p.role,               // required
  department: p.department ?? undefined,
  pageAccess: Array.isArray(p.page_access)
    ? p.page_access
    : typeof p.page_access === "string"
      ? p.page_access.split(",").map((s: string) => s.trim()).filter(Boolean)
      : undefined,
  page_access: p.page_access ?? undefined,
  created_at: p.created_at,
  updated_at: p.updated_at,
});

export default function UserAssignmentSection({ groupId, isDefaultGroup }: UserAssignmentSectionProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      // 1) Load user_ids linked to this group
      const { data: links, error: linksErr } = await supabase
        .from("group_users") // columns: group_id uuid, user_id uuid (FK -> user_profiles.id)
        .select("user_id")
        .eq("group_id", groupId);

      if (linksErr) {
        console.error("Failed to load group_users:", linksErr);
        setAssignedUsers([]);
        setAvailableUsers([]);
        return;
      }

      const assignedIds: string[] = (links ?? [])
        .map((r: any) => r.user_id)
        .filter(Boolean);

      // 2) Load all user profiles
      const { data: profiles, error: profErr } = await supabase
        .from("user_profiles")
        .select(PROFILE_SELECT);

      if (profErr) {
        console.error("Failed to load user_profiles:", profErr);
        setAssignedUsers([]);
        setAvailableUsers([]);
        return;
      }

      const allUsers = (profiles ?? []).map(mapProfileToUser);
      const assignedSet = new Set(assignedIds);

      const assigned = allUsers.filter(u => assignedSet.has(u.id));
      const available = allUsers.filter(u => !assignedSet.has(u.id));

      setAssignedUsers(assigned);
      setAvailableUsers(available);
    })();
  }, [groupId, supabase]);

  const handleAssignUser = async (user: User) => {
    setAssignedUsers(prev => [...prev, user]);
    setAvailableUsers(prev => prev.filter(u => u.id !== user.id));
    await supabase.from("group_users").insert({ group_id: groupId, user_id: user.id });
  };

  const handleRemoveUser = async (userId: string) => {
    const userToRemove = assignedUsers.find(u => u.id === userId);
    if (!userToRemove) return;
    setAssignedUsers(prev => prev.filter(u => u.id !== userId));
    setAvailableUsers(prev => [...prev, userToRemove]);
    await supabase.from("group_users").delete().eq("group_id", groupId).eq("user_id", userId);
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      (user.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      `${user.name ?? ""} ${user.surname ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
      (user.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

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
                              {(user.name ?? "")} {(user.surname ?? "")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @{user.username ?? "n/a"} • {user.department ?? "n/a"}
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
                  {(user.name ?? "")} {(user.surname ?? "")}
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
  );
}
