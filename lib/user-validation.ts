import { supabase } from "@/lib/supabase"

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface EmailCheckResult {
  isAvailable: boolean
  error?: string
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password strength validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain uppercase, lowercase, number, and special character",
    }
  }

  return { isValid: true }
}

export async function checkEmailAvailability(email: string): Promise<EmailCheckResult> {
  try {
    if (!validateEmail(email)) {
      return { isAvailable: false, error: "Invalid email format" }
    }

    // Check in Supabase auth users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)

    if (authError && authError.message !== "User not found") {
      console.error("Error checking email in auth:", authError)
      return { isAvailable: false, error: "Unable to verify email availability" }
    }

    if (authUser?.user) {
      return { isAvailable: false, error: "Email already exists" }
    }

    // Also check in user_profiles table
    const { data: profileUser, error: profileError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("email", email)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking email in profiles:", profileError)
      return { isAvailable: false, error: "Unable to verify email availability" }
    }

    if (profileUser) {
      return { isAvailable: false, error: "Email already exists" }
    }

    return { isAvailable: true }
  } catch (error) {
    console.error("Email availability check failed:", error)
    return { isAvailable: false, error: "Unable to verify email availability" }
  }
}

export function validateUserData(userData: any, isEdit = false): ValidationResult {
  const errors: Record<string, string> = {}

  // Name validation
  if (!userData.name?.trim()) {
    errors.name = "First name is required"
  } else if (userData.name.trim().length < 2) {
    errors.name = "First name must be at least 2 characters"
  }

  // Surname validation
  if (!userData.surname?.trim()) {
    errors.surname = "Last name is required"
  } else if (userData.surname.trim().length < 2) {
    errors.surname = "Last name must be at least 2 characters"
  }

  // Email validation
  if (!userData.email?.trim()) {
    errors.email = "Email is required"
  } else if (!validateEmail(userData.email)) {
    errors.email = "Invalid email format"
  }

  // Password validation (only for new users or when password is provided)
  if (!isEdit && !userData.password?.trim()) {
    errors.password = "Password is required"
  } else if (userData.password?.trim()) {
    const passwordValidation = validatePassword(userData.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message || "Invalid password"
    }
  }

  // Role validation
  if (!userData.role) {
    errors.role = "Role is required"
  } else if (!["admin", "manager", "employee", "client", "guest"].includes(userData.role)) {
    errors.role = "Invalid role selected"
  }

  // Department validation
  if (!userData.department?.trim()) {
    errors.department = userData.role === "client" ? "Company name is required" : "Department is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function generateSecurePassword(length = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "@$!%*?&"

  const allChars = lowercase + uppercase + numbers + symbols

  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export function getDefaultPageAccess(role: string): string[] {
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
      ]
    case "manager":
      return ["dashboard", "orders", "customers", "documents", "deliveries", "courierOrders", "shipmentTracker"]
    case "employee":
      return ["dashboard", "orders", "documents", "deliveries"]
    case "client":
      return ["clientPortal", "shipmentTracker"]
    case "guest":
      return ["shipmentTracker"]
    default:
      return ["dashboard"]
  }
}
