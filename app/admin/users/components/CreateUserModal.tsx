"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User, UserGroup, UserRole } from "@/types/auth"
import { AlertCircle, Check, RefreshCw, Building2, UserIcon } from "lucide-react"

interface CreateUserFormData extends Partial<User> {
  password: string
}

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (user: Partial<User>) => void
  userGroups: UserGroup[]
  existingEmails: string[]
  defaultRole?: UserRole
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
  userGroups,
  existingEmails,
  defaultRole = "employee",
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: defaultRole,
    department: defaultRole === "client" ? "" : "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Reset form when modal opens/closes or defaultRole changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: defaultRole,
        department: defaultRole === "client" ? "" : "",
      })
      setErrors({})
      setIsEmailAvailable(null)
    }
  }, [isOpen, defaultRole])

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

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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

    // For client users, require company/department
    if (formData.role === "client" && !formData.department?.trim()) {
      newErrors.department = "Company name is required for client users"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const { password, ...userData } = formData
      onCreateUser({
        ...userData,
        sendWelcomeEmail,
      })
    }
  }

  const isClientUser = formData.role === "client"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {isClientUser ? (
              <>
                <Building2 className="h-5 w-5 text-purple-500" />
                Add New Client User
              </>
            ) : (
              <>
                <UserIcon className="h-5 w-5 text-blue-500" />
                Add New Internal User
              </>
            )}
          </DialogTitle>
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
            <Label htmlFor="role">User Type</Label>
            <Select
              value={formData.role || "employee"}
              onValueChange={(value) => handleInputChange("role", value as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="client">Client (External)</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className={errors.department ? "text-red-500" : ""}>
              {isClientUser ? "Company Name *" : "Department"}
            </Label>
            {isClientUser ? (
              <Input
                id="department"
                placeholder="e.g., ABC Logistics Ltd"
                value={formData.department || ""}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className={errors.department ? "border-red-500" : ""}
              />
            ) : (
              <Select
                value={formData.department || "unassigned"}
                onValueChange={(value) => handleInputChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
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
            )}
            {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>
                Temporary Password *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomPassword}
                className="text-xs bg-transparent"
              >
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

          {isClientUser && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Client Access Permissions</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Access to client portal dashboard</li>
                <li>• View their assigned orders only</li>
                <li>• Track shipments in real-time</li>
                <li>• Download order documents</li>
                <li>• Receive delivery confirmations</li>
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="send-email"
              checked={sendWelcomeEmail}
              onChange={(e) => setSendWelcomeEmail(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="send-email">Send welcome email with login credentials</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className={isClientUser ? "bg-purple-600 hover:bg-purple-700" : ""}>
            Create {isClientUser ? "Client" : "User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
