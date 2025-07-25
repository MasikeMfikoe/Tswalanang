"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { User, UserRole } from "@/types/auth"
import { AlertCircle, Check, RefreshCw, Building2, UserIcon } from "lucide-react"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (user: Partial<User>) => void
  userType: "internal" | "client"
}

export default function CreateUserModal({ isOpen, onClose, onCreateUser, userType }: CreateUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: userType === "client" ? "client" : "employee",
    department: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Reset form when modal opens/closes or userType changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: userType === "client" ? "client" : "employee",
        department: "",
      })
      setErrors({})
      setIsEmailAvailable(null)
    }
  }, [isOpen, userType])

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
      // In a real implementation, this would check against the database
      const isAvailable = true // For now, assume all emails are available
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
    if (userType === "client" && !formData.department?.trim()) {
      newErrors.department = "Company name is required for client users"
    }

    // For internal users, require role and department
    if (userType === "internal") {
      if (!formData.role) {
        newErrors.role = "Role is required"
      }
      if (!formData.department?.trim()) {
        newErrors.department = "Department is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCreateUser({
        ...formData,
        sendWelcomeEmail,
      })
    }
  }

  const isClientUser = userType === "client"

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

          {!isClientUser && (
            <div className="space-y-2">
              <Label htmlFor="role" className={errors.role ? "text-red-500" : ""}>
                User Role *
              </Label>
              <Select
                value={formData.role || "employee"}
                onValueChange={(value) => handleInputChange("role", value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="department" className={errors.department ? "text-red-500" : ""}>
              {isClientUser ? "Company Name *" : "Department *"}
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
                value={formData.department || ""}
                onValueChange={(value) => handleInputChange("department", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
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
            <Switch id="send-email" checked={sendWelcomeEmail} onCheckedChange={setSendWelcomeEmail} />
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
