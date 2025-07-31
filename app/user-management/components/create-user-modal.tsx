"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/AuthContext"
import { type UserRole, rolePermissions } from "@/types/auth"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { userSchema } from "@/lib/user-validation" // Import validation schemas
import type { z } from "zod"
import { defaultPermissions } from "@/lib/default-permissions" // Import defaultPermissions

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
  isClientUserCreation?: boolean // New prop to differentiate
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
  isClientUserCreation = false,
}: CreateUserModalProps) {
  const { createUser, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState<UserRole>(isClientUserCreation ? "client" : "employee")
  const [pageAccess, setPageAccess] = useState<string[]>([])
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<z.ZodIssue[] | null>(null)
  const [emailAvailability, setEmailAvailability] = useState<"checking" | "available" | "taken" | null>(null)

  // Get all available modules from defaultPermissions
  const allModules = Object.keys(defaultPermissions)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setName("")
      setSurname("")
      setEmail("")
      setPassword("")
      setDepartment("")
      setRole(isClientUserCreation ? "client" : "employee") // Set role based on prop
      setSendWelcomeEmail(true)
      setErrors(null)
      setEmailAvailability(null)
    }
  }, [isOpen, isClientUserCreation])

  useEffect(() => {
    // Update page access when role changes to reflect default permissions for the new role
    const defaultAccess = rolePermissions[role]
    if (defaultAccess) {
      setPageAccess(Object.keys(defaultAccess).filter((module) => defaultAccess[module].view))
    }
  }, [role])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (email.trim() && errors?.filter((e) => e.path[0] === "email").length === 0) {
        setEmailAvailability("checking")
        try {
          const response = await fetch(`/api/check-email-availability?email=${email}`)
          const data = await response.json()
          setEmailAvailability(data.available ? "available" : "taken")
        } catch (error) {
          console.error("Error checking email availability:", error)
          setEmailAvailability(null) // Reset on error
        }
      } else {
        setEmailAvailability(null)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(delayDebounceFn)
  }, [email, errors])

  const handleCreateUser = async () => {
    setIsLoading(true)
    setErrors(null) // Clear previous errors

    try {
      // Validate all fields using Zod schema
      const validationResult = userSchema.safeParse({
        name,
        surname,
        email,
        password,
        department,
        role,
        pageAccess,
        sendWelcomeEmail,
      })

      if (!validationResult.success) {
        setErrors(validationResult.error.issues)
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (emailAvailability === "taken") {
        setErrors([{ path: ["email"], message: "This email is already registered." } as z.ZodIssue])
        toast({
          title: "Validation Error",
          description: "This email is already registered.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const success = await createUser(validationResult.data)

      if (success) {
        toast({
          title: "User Created",
          description: `User ${name} ${surname} has been successfully created.`,
          variant: "default",
        })
        onUserCreated()
        onClose()
      } else {
        toast({
          title: "Creation Failed",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error creating user:", error)
      setErrors([{ path: ["general"], message: error.message || "An unexpected error occurred." } as z.ZodIssue])
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred while creating the user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageAccessChange = (module: string, checked: boolean) => {
    setPageAccess((prev) => (checked ? [...prev, module] : prev.filter((accessModule) => accessModule !== module)))
  }

  const getErrorMessage = (field: string) => {
    return errors?.find((err) => err.path[0] === field)?.message
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isClientUserCreation ? "Create New Client User" : "Create New Internal User"}</DialogTitle>
          <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              {getErrorMessage("name") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("name")}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="surname" className="text-right">
              Surname
            </Label>
            <div className="col-span-3">
              <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} className="col-span-3" />
              {getErrorMessage("surname") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("surname")}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
              {getErrorMessage("email") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("email")}</p>}
              {emailAvailability === "checking" && (
                <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
              )}
              {emailAvailability === "available" && <p className="text-sm text-green-600 mt-1">Email available!</p>}
              {emailAvailability === "taken" && <p className="text-sm text-red-500 mt-1">Email already registered.</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="col-span-3">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
              {getErrorMessage("password") && (
                <p className="text-red-500 text-xs mt-1">{getErrorMessage("password")}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Department
            </Label>
            <div className="col-span-3">
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="col-span-3"
              />
              {getErrorMessage("department") && (
                <p className="text-red-500 text-xs mt-1">{getErrorMessage("department")}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <div className="col-span-3">
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isClientUserCreation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {!isClientUserCreation ? (
                    <>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="tracking">Tracking User</SelectItem>
                    </>
                  ) : (
                    <SelectItem value="client">Client</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {getErrorMessage("role") && <p className="text-red-500 text-xs mt-1">{getErrorMessage("role")}</p>}
            </div>
          </div>

          {!isClientUserCreation && ( // Only show page access for internal roles
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Page Access</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {allModules.map((module) => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={`access-${module}`}
                      checked={pageAccess.includes(module)}
                      onCheckedChange={(checked) => handlePageAccessChange(module, checked === true)}
                    />
                    <label
                      htmlFor={`access-${module}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sendWelcomeEmail" className="text-right">
              Send Welcome Email
            </Label>
            <div className="col-span-3">
              <Checkbox
                id="sendWelcomeEmail"
                checked={sendWelcomeEmail}
                onCheckedChange={(checked) => setSendWelcomeEmail(checked === true)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            disabled={isLoading || isAuthLoading || emailAvailability === "taken" || emailAvailability === "checking"}
          >
            {isLoading || isAuthLoading ? <Spinner className="mr-2" /> : null}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
