import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getUser() {
  // Placeholder function for fetching user data.
  // In a real application, this would likely involve an API call or database query.
  return {
    id: "test-user-id",
    username: "testuser",
    name: "Test",
    surname: "User",
    role: "employee",
    department: "Sales",
    pageAccess: ["dashboard", "orders"],
  }
}
