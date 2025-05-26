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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a simple mock user for development
const MOCK_USER: User = {
  id: "mock-user-id",
  username: "demo",
  name: "Demo",
  surname: "User",
  role: "admin",
  department: "IT",
  pageAccess: ["dashboard", "orders", "customers", "documents", "deliveries", "courierOrders", "shipmentTracker"],
}

// Create a mock tracking user
const MOCK_TRACKING_USER: User = {
  id: "mock-tracking-id",
  username: "tracking",
  name: "Tracking",
  surname: "User",
  role: "guest",
  department: "Client",
  pageAccess: ["shipmentTracker"],
}

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
        setUser(MOCK_USER)

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(MOCK_USER))
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
        setUser(MOCK_TRACKING_USER)

        // Store in localStorage for persistence
        try {
          localStorage.setItem("user", JSON.stringify(MOCK_TRACKING_USER))
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
        // Find user by username first
        const { data: userProfiles, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("username", username)
          .single()

        if (profileError) {
          console.error("User profile not found:", profileError)

          // If in development mode, allow login with any credentials for testing
          if (process.env.NODE_ENV === "development") {
            console.log("Development mode: Creating mock user for testing")
            const testUser: User = {
              id: `mock-${Date.now()}`,
              username: username,
              name: "Test",
              surname: "User",
              role: "employee",
              department: "Test",
              pageAccess: ["dashboard", "orders"],
            }
            setUser(testUser)
            try {
              localStorage.setItem("user", JSON.stringify(testUser))
            } catch (e) {
              console.log("Error saving to localStorage:", e)
            }
            return true
          }

          return false
        }

        // Now sign in with email/password
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

        // If Supabase is unavailable in development, still allow demo login
        if (process.env.NODE_ENV === "development" && username === "demo") {
          console.log("Supabase unavailable, using mock login for demo")
          setUser(MOCK_USER)
          try {
            localStorage.setItem("user", JSON.stringify(MOCK_USER))
          } catch (e) {
            console.log("Error saving to localStorage:", e)
          }
          return true
        }

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

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: `${userData.username}@example.com`, // In a real app, you'd use the actual email
        password: userData.password || "defaultPassword123", // In a real app, you'd require a password
      })

      if (error) {
        console.error("Registration error:", error)
        return false
      }

      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: data.user?.id,
        username: userData.username,
        name: userData.name,
        surname: userData.surname,
        role: userData.role || "guest",
        department: userData.department,
        page_access: userData.pageAccess || [],
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return false
      }

      console.log("User registered successfully")
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

      // Update user profile
      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: userData.name,
          surname: userData.surname,
          role: userData.role,
          department: userData.department,
          page_access: userData.pageAccess,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Update error:", error)
        return false
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

  // Get all users (admin only)
  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("Fetching all users")

      // For development/demo purposes
      if (process.env.NODE_ENV === "development" || user?.username === "demo") {
        console.log("Returning mock users for development")
        return [
          {
            id: "tracking-user-1",
            username: "trackinguser1",
            name: "Tracking",
            surname: "User One",
            role: "guest",
            department: "Client",
            pageAccess: ["shipmentTracker"],
          },
          {
            id: "tracking-user-2",
            username: "trackinguser2",
            name: "Tracking",
            surname: "User Two",
            role: "guest",
            department: "Client",
            pageAccess: ["shipmentTracker"],
          },
          MOCK_TRACKING_USER,
        ]
      }

      // Check if user is admin
      if (!user || user.role !== "admin") {
        console.error("Only admins can fetch all users")
        return []
      }

      // Fetch users from Supabase
      const { data, error } = await supabase.from("user_profiles").select("*")

      if (error) {
        console.error("Error fetching users:", error)
        return []
      }

      // Map to User type
      return data.map((profile) => ({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        surname: profile.surname,
        role: profile.role as UserRole,
        department: profile.department,
        pageAccess: profile.page_access || [],
      }))
    } catch (error) {
      console.error("Error in getUsers:", error)
      return []
    }
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
