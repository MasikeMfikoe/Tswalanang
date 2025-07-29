"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User, UserRole } from "@/types/auth"
import { AlertCircle, Check, RefreshCw, Building2, UserIcon, Eye, EyeOff } from "lucide-react"
import { validateUserData, generateSecurePassword, getDefaultPageAccess } from "@/lib/user-validation"

interface ImprovedCreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (user: Partial<User>) => Promise<void>
  userType: "internal" | "client"
}

export default function ImprovedCreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
  userType,
}: ImprovedCreateUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: userType === "client" ? "client" : "employee",
    department: "",
    pageAccess: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reset form when modal opens/closes or userType changes
  useEffect(() => {
    if (isOpen) {
      const defaultRole = userType === "client" ? "client" : "employee"
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: defaultRole,
        department: "",
        pageAccess: getDefaultPageAccess(defaultRole),
      })
      setErrors({})
      setIsEmailAvailable(null)
      setSubmitError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, userType])

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes("@")) {
      setIsEmailAvailable(null)
      return
    }

    setIsCheckingEmail(true)
    setIsEmailAvailable(null)

    try {
      const response = await fetch("/api/check-email-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsEmailAvailable(result.isAvailable)
        if (!result.isAvailable) {
          setErrors((prev) => ({ ...prev, email: result.error || "Email already exists" }))
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.email
            return newErrors
          })
        }
      } else {
        setErrors((prev) => ({ ...prev, email: "Unable to verify email availability" }))
      }
    } catch (error) {
      console.error("Email check failed:", error)
      setErrors((prev) => ({ ...prev, email: "Unable to verify email availability" }))
    } finally {
      setIsCheckingEmail(false)
    }
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

    // Clear submit error
    if (submitError) {
      setSubmitError(null)
    }

    // Update page access when role changes
    if (field === "role") {
      setFormData((prev) => ({
        ...prev,
        pageAccess: getDefaultPageAccess(value),
      }))
    }
  }

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailAvailability(formData.email)
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12)
    setFormData((prev) => ({ ...prev, password: newPassword }))

    // Clear password error if it exists
    if (errors.password) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Validate form data
      const validation = validateUserData(formData, false)

      if (!validation.isValid) {
        setErrors(validation.errors)
        setIsSubmitting(false)
        return
      }

      // Check email availability one more time
      if (isEmailAvailable === false) {
        setErrors((prev) => ({ ...prev, email: "Email is not available" }))
        setIsSubmitting(false)
        return
      }

      // Prepare user data
      const userData = {
        ...formData,
        sendWelcomeEmail,
        pageAccess: formData.pageAccess || getDefaultPageAccess(formData.role!),
      }

      await onCreateUser(userData)

      // Close modal on success
      onClose()
    } catch (error) {
      console.error("User creation failed:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsSubmitting(false)
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                className={`pr-10 ${
                  errors.email ? "border-red-500" : isEmailAvailable === true ? "border-green-500" : ""
                }`}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            ) : (
              <Select
                value={formData.department || ""}
                onValueChange={(value) => handleInputChange("department", value)}
                disabled={isSubmitting}
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
                onClick={handleGeneratePassword}
                className="text-xs bg-transparent"
                disabled={isSubmitting}
              >
                Generate Secure Password
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
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
            <Switch
              id="send-email"
              checked={sendWelcomeEmail}
              onCheckedChange={setSendWelcomeEmail}
              disabled={isSubmitting}
            />
            <Label htmlFor="send-email">Send welcome email with login credentials</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={isClientUser ? "bg-purple-600 hover:bg-purple-700" : ""}
            disabled={isSubmitting || isEmailAvailable === false}
          >
            {isSubmitting ? "Creating..." : `Create ${isClientUser ? "Client" : "User"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
