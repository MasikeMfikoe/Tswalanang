"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { User, UserGroup, UserRole } from "@/types/auth"
import { AlertCircle, Check, RefreshCw } from "lucide-react"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (user: Partial<User>) => void
  userGroups: UserGroup[]
  existingEmails: string[]
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
  userGroups,
  existingEmails,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
      })
      setErrors({})
      setIsEmailAvailable(null)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkEmailAvailability = (email: string) => {
    if (!email || !validateEmail(email)) {
      setIsEmailAvailable(null)
      return
    }

    setIsCheckingEmail(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      const isAvailable = !existingEmails.includes(email)
      setIsEmailAvailable(isAvailable)
      setIsCheckingEmail(false)

      if (!isAvailable) {
        setErrors((prev) => ({ ...prev, email: "Email already exists" }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.email
          return newErrors
        })
      }
    }, 500)
  }

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Don't check email availability on every keystroke
    // We'll do it on blur instead
  }

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailAvailability(formData.email)
    }
  }

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "First name is required"
    }

    if (!formData.surname?.trim()) {
      newErrors.surname = "Last name is required"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    } else if (isEmailAvailable === false) {
      newErrors.email = "Email already exists"
    }

    if (!formData.password?.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCreateUser({
        ...formData,
        // In a real app, you would handle the welcome email on the server
        // This is just to simulate the functionality
        sendWelcomeEmail,
      })
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={errors.name ? "text-red-500" : ""}>
                First Name *
              </Label>
              <Input
                id="firstName"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className={errors.surname ? "text-red-500" : ""}>
                Last Name *
              </Label>
              <Input
                id="lastName"
                value={formData.surname || ""}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                className={errors.surname ? "border-red-500" : ""}
              />
              {errors.surname && <p className="text-xs text-red-500">{errors.surname}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>
              Email Address *
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={handleEmailBlur}
                className={`pr-10 ${errors.email ? "border-red-500" : isEmailAvailable === true ? "border-green-500" : ""}`}
              />
              {isCheckingEmail && (
                <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {isEmailAvailable === true && !isCheckingEmail && (
                <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
              {isEmailAvailable === false && !isCheckingEmail && (
                <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Assign to Group</Label>
            <Select
              value={formData.department || "unassigned"}
              onValueChange={(value) => handleInputChange("department", value)}
            >
              <SelectTrigger id="group" className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {userGroups.map((group) => (
                  <SelectItem key={group.id} value={group.name}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role || "employee"}
              onValueChange={(value) => handleInputChange("role", value as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>
                Temporary Password *
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={generateRandomPassword} className="text-xs">
                Generate Random Password
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="send-email" checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
            <Label htmlFor="send-email">Send welcome email with login credentials</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
