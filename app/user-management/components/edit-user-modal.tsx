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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User, UserRole } from "@/types/auth"
import { useAuth } from "@/contexts/AuthContext"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateUser: (userData: Partial<User>) => Promise<void>
  user: User | null
  userType: "internal" | "client"
}

export default function EditUserModal({ isOpen, onClose, onUpdateUser, user, userType }: EditUserModalProps) {
  const { getUsers } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    role: "employee" as UserRole,
    department: "",
    pageAccess: [] as string[],
    password: "",
    sendWelcomeEmail: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateFields, setDuplicateFields] = useState<string[]>([])
  const [pendingData, setPendingData] = useState<Partial<User> | null>(null)

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email || "",
        role: user.role,
        department: user.department,
        pageAccess: user.pageAccess || [],
        password: "",
        sendWelcomeEmail: false,
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePageAccessChange = (page: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      pageAccess: checked ? [...prev.pageAccess, page] : prev.pageAccess.filter((p) => p !== page),
    }))
  }

  const checkForDuplicates = async (userData: Partial<User>): Promise<string[]> => {
    try {
      const allUsers = await getUsers()
      const duplicates: string[] = []

      // Check for duplicates excluding the current user
      const otherUsers = allUsers.filter((u) => u.id !== user?.id)

      if (userData.email && otherUsers.some((u) => u.email === userData.email)) {
        duplicates.push("email")
      }

      const username = `${userData.name?.toLowerCase()}.${userData.surname?.toLowerCase()}`
      if (otherUsers.some((u) => u.username === username)) {
        duplicates.push("username")
      }

      return duplicates
    } catch (error) {
      console.error("Error checking for duplicates:", error)
      return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const userData: Partial<User> = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        pageAccess: formData.pageAccess,
      }

      // Only include password if it's provided
      if (formData.password.trim()) {
        userData.password = formData.password
      }

      // Check for duplicates
      const duplicates = await checkForDuplicates(userData)

      if (duplicates.length > 0) {
        setDuplicateFields(duplicates)
        setPendingData(userData)
        setShowDuplicateDialog(true)
        setIsLoading(false)
        return
      }

      // No duplicates, proceed with update
      await onUpdateUser(userData)
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDuplicate = async () => {
    if (pendingData) {
      setShowDuplicateDialog(false)
      setIsLoading(true)
      try {
        await onUpdateUser(pendingData)
      } catch (error) {
        console.error("Error updating user after confirmation:", error)
      } finally {
        setIsLoading(false)
        setPendingData(null)
        setDuplicateFields([])
      }
    }
  }

  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false)
    setPendingData(null)
    setDuplicateFields([])
    setIsLoading(false)
  }

  const availableRoles: UserRole[] = userType === "client" ? ["client"] : ["admin", "manager", "employee"]

  const availablePages =
    userType === "client"
      ? ["clientPortal", "shipmentTracker"]
      : [
          "dashboard",
          "orders",
          "customers",
          "documents",
          "deliveries",
          "courierOrders",
          "shipmentTracker",
          "userManagement",
        ]

  if (!user) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit {userType === "client" ? "Client" : "Internal"} User</DialogTitle>
            <DialogDescription>Update the user's information. Fields marked with * are required.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{userType === "client" ? "Company Name *" : "Department *"}</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter new password or leave blank"
              />
            </div>

            <div className="space-y-2">
              <Label>Page Access</Label>
              <div className="grid grid-cols-2 gap-2">
                {availablePages.map((page) => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={page}
                      checked={formData.pageAccess.includes(page)}
                      onCheckedChange={(checked) => handlePageAccessChange(page, checked as boolean)}
                    />
                    <Label htmlFor={page} className="text-sm">
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) => handleInputChange("sendWelcomeEmail", checked as boolean)}
              />
              <Label htmlFor="sendWelcomeEmail" className="text-sm">
                Send welcome email with updated credentials
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Information Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Some of the user details you entered already exist for another user:
              <ul className="mt-2 list-disc list-inside">
                {duplicateFields.includes("email") && <li>Email address</li>}
                {duplicateFields.includes("username") && <li>Username (generated from name)</li>}
              </ul>
              Do you want to continue saving anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDuplicate}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDuplicate}>Yes, Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
