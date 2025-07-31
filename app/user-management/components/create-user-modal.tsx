"use client"

import type React from "react"

import { useState } from "react"
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
import type { User, UserRole } from "@/types/auth"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (userData: Partial<User> & { password?: string; sendWelcomeEmail?: boolean }) => Promise<void>
  userType: "internal" | "client"
}

export default function CreateUserModal({ isOpen, onClose, onCreateUser, userType }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    role: userType === "client" ? "client" : ("employee" as UserRole),
    department: "",
    password: "",
    sendWelcomeEmail: false,
    pageAccess: [] as string[],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availablePages = [
    "dashboard",
    "orders",
    "customers",
    "documents",
    "deliveries",
    "courierOrders",
    "shipmentTracker",
    "clientPortal",
    "userManagement",
    "auditTrail",
    "rateCard",
    "currencyConversion",
    "containerTracking",
  ]

  const getDefaultPageAccess = (role: UserRole): string[] => {
    switch (role) {
      case "admin":
        return [
          "dashboard",
          "orders",
          "customers",
          "documents",
          "deliveries",
          "courierOrders",
          "shipmentTracker",
          "userManagement",
          "auditTrail",
          "rateCard",
          "currencyConversion",
          "containerTracking",
        ]
      case "manager":
        return ["dashboard", "orders", "customers", "deliveries", "courierOrders", "rateCard"]
      case "employee":
        return ["dashboard", "orders", "documents"]
      case "client":
        return ["clientPortal", "shipmentTracker"]
      default:
        return ["dashboard"]
    }
  }

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
      pageAccess: getDefaultPageAccess(role),
    })
  }

  const handlePageAccessToggle = (page: string) => {
    const newPageAccess = formData.pageAccess.includes(page)
      ? formData.pageAccess.filter((p) => p !== page)
      : [...formData.pageAccess, page]

    setFormData({
      ...formData,
      pageAccess: newPageAccess,
    })
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onCreateUser({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        pageAccess: formData.pageAccess,
        password: formData.password,
        sendWelcomeEmail: formData.sendWelcomeEmail,
      })

      // Reset form
      setFormData({
        name: "",
        surname: "",
        email: "",
        role: userType === "client" ? "client" : "employee",
        department: "",
        password: "",
        sendWelcomeEmail: false,
        pageAccess: [],
      })
    } catch (error) {
      console.error("Error in modal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      surname: "",
      email: "",
      role: userType === "client" ? "client" : "employee",
      department: "",
      password: "",
      sendWelcomeEmail: false,
      pageAccess: [],
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create {userType === "client" ? "Client" : "Internal"} User</DialogTitle>
          <DialogDescription>
            {userType === "client"
              ? "Create a new client user with limited access to their orders and tracking."
              : "Create a new internal user with access to the system based on their role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">First Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="surname">Last Name *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="department">{userType === "client" ? "Company Name *" : "Department *"}</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder={userType === "client" ? "e.g., ABC Company Ltd" : "e.g., Operations, IT, Sales"}
              required
            />
          </div>

          {userType === "internal" && (
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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
          </div>

          {userType === "internal" && (
            <div>
              <Label>Page Access</Label>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.pageAccess.map((page) => (
                    <Badge key={page} variant="default" className="flex items-center gap-1">
                      {page}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handlePageAccessToggle(page)} />
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {availablePages
                    .filter((page) => !formData.pageAccess.includes(page))
                    .map((page) => (
                      <Button
                        key={page}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageAccessToggle(page)}
                      >
                        + {page}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendWelcomeEmail"
              checked={formData.sendWelcomeEmail}
              onCheckedChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked as boolean })}
            />
            <Label htmlFor="sendWelcomeEmail">Send welcome email with login credentials</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
