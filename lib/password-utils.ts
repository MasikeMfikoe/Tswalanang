// Password utility functions for consistent password handling across the app

export interface PasswordValidationResult {
  isValid: boolean
  message?: string
  score: number // 0-4 strength score
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, message: "Password is required", score: 0 }
  }

  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long", score: 0 }
  }

  let score = 0
  const checks = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    hasMinLength: password.length >= 8,
    hasGoodLength: password.length >= 12,
  }

  // Calculate score
  if (checks.hasLowercase) score++
  if (checks.hasUppercase) score++
  if (checks.hasNumbers) score++
  if (checks.hasSpecialChars) score++
  if (checks.hasGoodLength) score++

  // Check for required criteria
  if (!checks.hasLowercase) {
    return { isValid: false, message: "Password must contain at least one lowercase letter", score }
  }

  if (!checks.hasUppercase) {
    return { isValid: false, message: "Password must contain at least one uppercase letter", score }
  }

  if (!checks.hasNumbers) {
    return { isValid: false, message: "Password must contain at least one number", score }
  }

  if (!checks.hasSpecialChars) {
    return { isValid: false, message: "Password must contain at least one special character", score }
  }

  return { isValid: true, score }
}

export function generateSecurePassword(length = 12): string {
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
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export function getPasswordStrengthText(score: number): { text: string; color: string } {
  switch (score) {
    case 0:
    case 1:
      return { text: "Very Weak", color: "text-red-600" }
    case 2:
      return { text: "Weak", color: "text-orange-600" }
    case 3:
      return { text: "Fair", color: "text-yellow-600" }
    case 4:
      return { text: "Good", color: "text-blue-600" }
    case 5:
      return { text: "Strong", color: "text-green-600" }
    default:
      return { text: "Unknown", color: "text-gray-600" }
  }
}

export function getPasswordRequirements(): string[] {
  return [
    "At least 8 characters long",
    "Contains uppercase letter (A-Z)",
    "Contains lowercase letter (a-z)",
    "Contains number (0-9)",
    "Contains special character (!@#$%^&*)",
  ]
}
