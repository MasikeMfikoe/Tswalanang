"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { type User, type UserRole, rolePermissions } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"
import { userSchema } from "@/lib/user-validation" // Import validation schemas
import type { z } from "zod"
import { defaultPermissions } from "@/lib/default-permissions" // Import defaultPermissions

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserUpdated: () => void
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const { updateUser, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || "")
  const [surname, setSurname] = useState(user?.surname || "")
  const [email, setEmail] = useState(user?.email || "")
  const [department, setDepartment] = useState(user?.department || "")
  const [role, setRole] = useState<UserRole>(user?.role || "employee")
  const [pageAccess, setPageAccess] = useState<string[]>(user?.pageAccess || [])
  const [password, setPassword] = useState("")
  const [sendNotificationEmail, setSendNotificationEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<z.ZodIssue[] | null>(null)

  // Get all available modules from defaultPermissions
  const allModules = Object.keys(defaultPermissions)

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name)
      setSurname(user.surname)
      setEmail(user.email || "")
      setDepartment(user.department)
      setRole(user.role)
      setPageAccess(user.pageAccess || [])
      setPassword("") // Clear password field on open
      setSendNotificationEmail(false) // Reset checkbox
      setErrors(null)
    }
  }, [isOpen, user])

  useEffect(() => {
    // Update page access when role changes to reflect default permissions for the new role
    const defaultAccess = rolePermissions[role]
    if (defaultAccess) {
      setPageAccess(Object.keys(defaultAccess).filter((module) => defaultAccess[module].view))
    }
  }, [role])

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
  }

  const handlePageAccessToggle = (module: string, checked: boolean) => {
    setPageAccess((prev) => (checked ? [...prev, module] : prev.filter((accessModule) => accessModule !== module)))
  }

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8) + "!" // Ensure special char
    setPassword(newPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors(null) // Clear previous errors

    try {
      const userDataToValidate = {
        name,
        surname,
        email,
        department,
        role,
        pageAccess,
        password: password || undefined, // Only include password if it's not empty
      }

      const validationResult = userSchema.partial().safeParse(userDataToValidate)

      if (!validationResult.success) {
        setErrors(validationResult.error.issues)
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!user) {
        throw new Error("User data not available for update.")
      }

      const success = await updateUser(user.id, {
        name,
        surname,
        email,
        department,
        role,
        pageAccess,
        password: password || undefined, // Pass password only if changed
        sendWelcomeEmail: sendNotificationEmail, // Use sendNotificationEmail for this context
      })

      if (success) {
        toast({
          title: "User Updated",
          description: `User ${name} ${surname} has been successfully updated.`,
          variant: "default",
        })
        onUserUpdated()
        onClose()
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating user:", error)
      setErrors([{ path: ["general"], message: error.message || "An unexpected error occurred." } as z.ZodIssue])
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred while updating the user.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = (field: string) => {
    return errors?.find((err) => err.path[0] === field)?.message
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit User: {user.name} {user.surname}
          </DialogTitle>
          <DialogDescription>Update the details for this user account.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">First Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              {getErrorMessage("name") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("name")}</p>}
            </div>
            <div>
              <Label htmlFor="surname">Last Name *</Label>
              <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
              {getErrorMessage("surname") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("surname")}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {getErrorMessage("email") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("email")}</p>}
          </div>

          <div>
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Operations, IT, Sales"
              required
            />
            {getErrorMessage("department") && (
              <p className="text-red-500 text-xs mt-1">{getErrorMessage("department")}</p>
            )}
          </div>

          {user.role !== "client" &&
            user.role !== "tracking" && ( // Only show role selection for internal users
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="tracking">Tracking User</SelectItem>
                  </SelectContent>
                </Select>
                {getErrorMessage("role") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("role")}</p>}
              </div>
            )}

          <div>
            <Label htmlFor="password">New Password (leave blank to keep current)</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password or leave blank"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
            {getErrorMessage("password") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("password")}</p>}
          </div>

          {user.role !== "client" &&
            user.role !== "tracking" && ( // Only show page access for internal roles
              <div>
                <Label>Page Access</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {pageAccess.map((module) => (
                      <Badge key={module} variant="default" className="flex items-center gap-1">
                        {module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, " $1")}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handlePageAccessToggle(module, false)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {allModules
                      .filter((module) => !pageAccess.includes(module))
                      .map((module) => (
                        <Button
                          key={module}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageAccessToggle(module, true)}
                        >
                          + {module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, " $1")}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendNotificationEmail"
              checked={sendNotificationEmail}
              onCheckedChange={(checked) => setSendNotificationEmail(checked === true)}
            />
            <Label htmlFor="sendNotificationEmail">Send notification email about changes</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isAuthLoading}>
              {isSubmitting || isAuthLoading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
