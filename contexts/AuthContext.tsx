"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User, UserRole } from "@/types/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: Partial<User>) => Promise<boolean>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  hasPermission: (module: string, action: string) => boolean
  refreshUser: () => Promise<void>
  getUsers: () => Promise<User[]>
  createUser: (userData: Omit<User, "id" | "username">) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create mock users for development
const MOCK_USERS: User[] = [
  {
    id: "mock-user-id",
    username: "demo",
    name: "Demo",
    surname: "User",
    role: "admin",
    department: "IT",
    pageAccess: ["dashboard", "orders", "customers", "documents", "deliveries", "courierOrders", "shipmentTracker"],
    email: "demo@tswsmartlog.com",
  },
  {
    id: "mock-tracking-id",
    username: "tracking",
    name: "Tracking",
    surname: "User",
    role: "guest",
    department: "Client",
    pageAccess: ["shipmentTracker"],
    email: "tracking@client.com",
  },
  {
    id: "mock-manager-id",
    username: "manager",
    name: "John",
    surname: "Manager",
    role: "manager",
    department: "Operations",
    pageAccess: ["dashboard", "orders", "customers", "deliveries"],
    email: "john.manager@tswsmartlog.com",
  },
  {
    id: "mock-employee-id",
    username: "employee",
    name: "Jane",
    surname: "Employee",
    role: "employee",
    department: "Customer Service",
    pageAccess: ["dashboard", "orders"],
    email: "jane.employee@tswsmartlog.com",
  },
  {
    id: "client-user-1",
    username: "client1",
    name: "Alice",
    surname: "Johnson",
    role: "client",
    department: "External",
    pageAccess: ["shipmentTracker"],
    email: "alice.johnson@clientcompany.com",
  },
  {
    id: "client-user-2",
    username: "client2",
    name: "Bob",
    surname: "Smith",
    role: "client",
    department: "External",
    pageAccess: ["shipmentTracker"],
    email: "bob.smith@anotherclient.com",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    // Try to get user from localStorage first (for development)
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        console.log("Found user in localStorage:", storedUser)
        setUser(JSON.parse(storedUser))
        setIsLoading(false)
        return
      }
    } catch (e) {
      console.log("Error reading from localStorage:", e)
    }

    // If no stored user, check Supabase
    checkUser()
  }, [])

  // Check if user is authenticated
  const checkUser = async () => {
    try {
      setIsLoading(true)
      console.log("Checking user authentication...")

      // Check for session in Supabase
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session:", sessionError)
        setUser(null)
        setIsLoading(false)
        return
      }

      if (session) {
        console.log("Found Supabase session:", session)

        try {
          // Get user profile from database
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("Error fetching user profile:", error)
            await supabase.auth.signOut()
            setUser(null)
            return
          }

          // Set user with profile data
          const userData = {
            id: session.user.id,
            username: profile.username,
            name: profile.name,
            surname: profile.surname,
            role: profile.role as UserRole,
            department: profile.department,
            pageAccess: profile.page_access || [],
            email: profile.email,
          }

          console.log("Setting user from Supabase:", userData)
          setUser(userData)

          // Also store in localStorage for persistence
          try {
            localStorage.setItem("user", JSON.stringify(userData))
          } catch (e) {
            console.log("Error saving to localStorage:", e)
          }
        } catch (error) {
          console.error("Error processing user profile:", error)
          setUser(null)
        }
      } else {
        console.log("No Supabase session found")
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log(`Attempting login for user: ${username}`)

      // DEVELOPMENT MODE: Always allow login with demo/demo or tracking/tracking
      if (username === "demo" && password === "demo") {
        console.log("Using mock login for demo user")

        // Set the mock user
        const mockUser = MOCK_USERS.find((u) => u.username === "demo")!
        setUser(mockUser)

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(mockUser))
          console.log("Saved mock user to localStorage")
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }

        console.log("Mock login successful")
        return true
      }

      // Special case for tracking user
      if (username === "tracking" && password === "tracking") {
        console.log("Using mock login for tracking user")

        // Set the mock tracking user
        const mockTrackingUser = MOCK_USERS.find((u) => u.username === "tracking")!
        setUser(mockTrackingUser)

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(mockTrackingUser))
          console.log("Saved mock tracking user to localStorage")
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }

        console.log("Mock tracking login successful")
        return true
      }

      // For real authentication with Supabase
      console.log("Attempting Supabase authentication")

      try {
        // Try to sign in with email/password first
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username}@example.com`, // In a real app, you'd use the actual email
          password,
        })

        if (error) {
          console.error("Supabase auth error:", error)
          return false
        }

        // Get user profile
        const { data: profile, error: profileGetError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileGetError) {
          console.error("Error getting user profile after login:", profileGetError)
          return false
        }

        // Set user with profile data
        const userData = {
          id: data.user.id,
          username: profile.username,
          name: profile.name,
          surname: profile.surname,
          role: profile.role as UserRole,
          department: profile.department,
          pageAccess: profile.page_access || [],
          email: profile.email,
        }

        console.log("Setting user from Supabase login:", userData)
        setUser(userData)

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(userData))
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }

        return true
      } catch (supabaseError) {
        console.error("Supabase operation failed:", supabaseError)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      console.log("Logging out...")

      // Sign out from Supabase
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error("Error signing out from Supabase:", error)
        // Continue with local logout even if Supabase fails
      }

      // Clear user state
      setUser(null)

      // Remove from localStorage
      try {
        localStorage.removeItem("user")
        console.log("Removed user from localStorage")
      } catch (e) {
        console.log("Error removing from localStorage:", e)
      }

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Registering new user:", userData)

      // For development, just add to mock users
      const newUser: User = {
        id: `mock-${Date.now()}`,
        username: userData.username || `${userData.name?.toLowerCase()}.${userData.surname?.toLowerCase()}`,
        name: userData.name || "",
        surname: userData.surname || "",
        role: userData.role || "employee",
        department: userData.department || "Default",
        pageAccess: userData.pageAccess || ["dashboard"],
        email: userData.email || `${userData.username}@tswsmartlog.com`,
      }

      MOCK_USERS.push(newUser)
      console.log("User registered successfully (mock):", newUser)
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Updating user:", userData)

      if (!user) {
        console.error("Cannot update: No user logged in")
        return false
      }

      // For development, update mock user
      const userIndex = MOCK_USERS.findIndex((u) => u.id === user.id)
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData }
      }

      // Update local user state
      const updatedUser = {
        ...user,
        ...userData,
      }

      console.log("Setting updated user:", updatedUser)
      setUser(updatedUser)

      // Update localStorage
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } catch (e) {
        console.log("Error saving to localStorage:", e)
      }

      console.log("User updated successfully")
      return true
    } catch (error) {
      console.error("Update error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission
  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false

    // Admin has all permissions
    if (user.role === "admin") return true

    // Check if user has access to the module
    if (!user.pageAccess.includes(module)) return false

    // Check role-based permissions
    switch (user.role) {
      case "manager":
        // Managers can view and edit but not delete
        return action !== "delete"
      case "employee":
        // Employees can only view
        return action === "view"
      default:
        return false
    }
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    await checkUser()
  }

  // Get all users - FIXED to avoid infinite recursion
  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("Fetching all users...")

      // For development/preview, return mock data to avoid Supabase RLS issues
      console.log("Returning mock users for development")
      return [...MOCK_USERS]

      // Uncomment below for production with proper RLS policies
      /*
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users from Supabase:", error)
        console.log("Falling back to mock data")
        return [...MOCK_USERS]
      }

      // Map to User type
      const users = data.map((profile) => ({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        surname: profile.surname,
        role: profile.role as UserRole,
        department: profile.department,
        pageAccess: profile.page_access || [],
        email: profile.email,
      }))

      console.log("Fetched users from database:", users)
      return users
      */
    } catch (error) {
      console.error("Error in getUsers:", error)
      console.log("Returning mock users as fallback")
      return [...MOCK_USERS]
    }
  }

  // Create user function
  const createUser = async (userData: Omit<User, "id" | "username">): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Creating new user:", userData)

      // Generate username from name and surname
      const username = `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}`

      // For development, add to mock users
      const newUser: User = {
        id: `mock-${Date.now()}`,
        username,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        pageAccess: userData.pageAccess || [],
      }

      MOCK_USERS.push(newUser)
      console.log("User created successfully (mock):", newUser)
      return true
    } catch (error) {
      console.error("Create user error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete user function
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Deleting user:", userId)

      // For development, remove from mock users
      const userIndex = MOCK_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        MOCK_USERS.splice(userIndex, 1)
        console.log("User deleted successfully (mock)")
        return true
      }

      console.log("User not found")
      return false
    } catch (error) {
      console.error("Delete user error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out alias
  const signOut = async (): Promise<void> => {
    await logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateUser,
        hasPermission,
        refreshUser,
        getUsers,
        createUser,
        deleteUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
