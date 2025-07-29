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
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import type { User, UserRole } from "@/types/auth"
import { useAuth } from "@/contexts/AuthContext"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateUser: (userData: Partial<User>) => Promise<void>
  user: User | null
  userType: "internal" | "client"
}

// Generate a secure password
function generateSecurePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

// Validate password strength
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" }
  }

  return { isValid: true }
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
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string>("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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
      setPasswordError("")
      setFormErrors({})
    }
  }, [user])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }

    // Validate password in real-time
    if (field === "password" && typeof value === "string") {
      if (value.trim()) {
        const validation = validatePassword(value)
        setPasswordError(validation.isValid ? "" : validation.message || "Invalid password")
      } else {
        setPasswordError("")
      }
    }
  }

  const handlePageAccessChange = (page: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      pageAccess: checked ? [...prev.pageAccess, page] : prev.pageAccess.filter((p) => p !== page),
    }))
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData((prev) => ({
      ...prev,
      password: newPassword,
    }))
    setPasswordError("")
    console.log("Generated secure password")
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "First name is required"
    }

    if (!formData.surname.trim()) {
      errors.surname = "Last name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (!formData.department.trim()) {
      errors.department = userType === "client" ? "Company name is required" : "Department is required"
    }

    // Validate password if provided
    if (formData.password.trim()) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message || "Invalid password"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
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

    // Validate form
    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    setIsLoading(true)

    try {
      const userData: Partial<User> = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim(),
        pageAccess: formData.pageAccess,
      }

      // Only include password if it's provided and valid
      if (formData.password.trim()) {
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
          setPasswordError(passwordValidation.message || "Invalid password")
          setIsLoading(false)
          return
        }
        userData.password = formData.password.trim()
      }

      // Include sendWelcomeEmail flag
      if (formData.sendWelcomeEmail) {
        userData.sendWelcomeEmail = true
      }

      console.log("Submitting user update:", {
        ...userData,
        password: userData.password ? "[REDACTED]" : "not provided",
      })

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

      // Reset form
      setFormData((prev) => ({
        ...prev,
        password: "",
        sendWelcomeEmail: false,
      }))
      setPasswordError("")
      setFormErrors({})
    } catch (error) {
      console.error("Error updating user:", error)

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("Password too weak")) {
          setPasswordError("Password is too weak. Please use a stronger password.")
        } else if (error.message.includes("email")) {
          setFormErrors((prev) => ({
            ...prev,
            email: "Email address is invalid or already in use",
          }))
        } else {
          // Generic error handling
          setFormErrors((prev) => ({
            ...prev,
            general: error.message,
          }))
        }
      }
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

        // Reset form
        setFormData((prev) => ({
          ...prev,
          password: "",
          sendWelcomeEmail: false,
        }))
        setPasswordError("")
        setFormErrors({})
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {userType === "client" ? "Client" : "Internal"} User</DialogTitle>
            <DialogDescription>Update the user's information. Fields marked with * are required.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {formErrors.general}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={formErrors.name ? "border-red-500" : ""}
                  required
                />
                {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  className={formErrors.surname ? "border-red-500" : ""}
                  required
                />
                {formErrors.surname && <p className="text-sm text-red-600">{formErrors.surname}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={formErrors.email ? "border-red-500" : ""}
                required
              />
              {formErrors.email && <p className="text-sm text-red-600">{formErrors.email}</p>}
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
                  className={formErrors.department ? "border-red-500" : ""}
                  required
                />
                {formErrors.department && <p className="text-sm text-red-600">{formErrors.department}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter new password or leave blank"
                  className={passwordError ? "border-red-500 pr-20" : "pr-20"}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="h-8 w-8 p-0"
                    title="Generate secure password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 w-8 p-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {formData.password && !passwordError && (
                <p className="text-sm text-green-600">✓ Password meets security requirements</p>
              )}
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
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
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !!passwordError}>
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
