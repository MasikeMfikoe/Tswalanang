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
  updateUser: (userId: string, userData: Partial<User>) => Promise<boolean>
  hasPermission: (module: string, action: string) => boolean
  refreshUser: () => Promise<void>
  getUsers: () => Promise<User[]>
  createUser: (userData: Omit<User, "id" | "username">) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create mock users for development - this will be the fallback data source
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
    department: "ABC Company",
    pageAccess: ["clientPortal", "shipmentTracker"],
    email: "alice.johnson@abccompany.com",
  },
  {
    id: "client-user-2",
    username: "client2",
    name: "Bob",
    surname: "Smith",
    role: "client",
    department: "XYZ Corp",
    pageAccess: ["clientPortal", "shipmentTracker"],
    email: "bob.smith@xyzcorp.com",
  },
]

// Persistent storage for created users
let CREATED_USERS: User[] = []

// Load created users from localStorage on startup
try {
  const stored = localStorage.getItem("created_users")
  if (stored) {
    CREATED_USERS = JSON.parse(stored)
    console.log("Loaded created users from localStorage:", CREATED_USERS.length)
  }
} catch (e) {
  console.log("Error loading created users from localStorage:", e)
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
            email: profile.email || session.user.email || `${profile.username}@tswsmartlog.com`,
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

  // Login function - PRIORITIZE SUPABASE AUTH
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log(`Attempting login for user: ${username}`)

      // First, try Supabase authentication with email
      const mockUser = MOCK_USERS.find((u) => u.username === username)
      if (mockUser) {
        console.log("Found mock user, trying Supabase auth with email:", mockUser.email)

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: mockUser.email,
            password: password,
          })

          if (!error && data.user) {
            console.log("✅ Supabase authentication successful")

            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", data.user.id)
              .single()

            if (!profileError && profile) {
              // Set user with Supabase profile data
              const userData = {
                id: data.user.id,
                username: profile.username,
                name: profile.name,
                surname: profile.surname,
                role: profile.role as UserRole,
                department: profile.department,
                pageAccess: profile.page_access || [],
                email: profile.email || data.user.email || mockUser.email,
              }

              console.log("Setting user from Supabase auth:", userData)
              setUser(userData)

              // Store in localStorage for persistence
              try {
                localStorage.setItem("user", JSON.stringify(userData))
              } catch (e) {
                console.log("Error saving to localStorage:", e)
              }

              return true
            }
          }
        } catch (supabaseError) {
          console.log("Supabase auth failed, falling back to mock:", supabaseError)
        }
      }

      // FALLBACK: Mock authentication for development
      if (username === "demo" && password === "demo") {
        console.log("Using mock login for demo user")
        const mockUser = MOCK_USERS.find((u) => u.username === "demo")!
        setUser(mockUser)

        try {
          localStorage.setItem("user", JSON.stringify(mockUser))
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }

        return true
      }

      if (username === "tracking" && password === "tracking") {
        console.log("Using mock login for tracking user")
        const mockTrackingUser = MOCK_USERS.find((u) => u.username === "tracking")!
        setUser(mockTrackingUser)

        try {
          localStorage.setItem("user", JSON.stringify(mockTrackingUser))
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }

        return true
      }

      console.log("❌ Authentication failed")
      return false
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

  // Update user function - HYBRID APPROACH: TRY SUPABASE + ALWAYS SAVE LOCALLY
  const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🔄 Updating user:", userId, userData)

      // Update in local storage first
      const userIndex = CREATED_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        CREATED_USERS[userIndex] = { ...CREATED_USERS[userIndex], ...userData }
        saveCreatedUsers()
        console.log("✅ User updated locally")
      }

      // Also update in mock users if it exists there
      const mockUserIndex = MOCK_USERS.findIndex((u) => u.id === userId)
      if (mockUserIndex !== -1) {
        MOCK_USERS[mockUserIndex] = { ...MOCK_USERS[mockUserIndex], ...userData }
        console.log("✅ Mock user updated")
      }

      // Try to update via API route
      try {
        console.log("📝 Attempting to update via API route...")

        const updateResponse = await fetch("/api/update-auth-user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            userData: userData,
          }),
        })

        if (updateResponse.ok) {
          const result = await updateResponse.json()
          console.log("✅ User updated via API route:", result)
        } else {
          const error = await updateResponse.text()
          console.error("❌ API route error:", error)
        }
      } catch (apiError) {
        console.error("❌ API call failed:", apiError)
      }

      // Update current user if it's the same user
      if (user && user.id === userId) {
        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)

        try {
          localStorage.setItem("user", JSON.stringify(updatedUser))
        } catch (e) {
          console.log("Error saving to localStorage:", e)
        }
      }

      console.log("🎉 User updated successfully!")
      return true
    } catch (error) {
      console.error("❌ Update user error:", error)
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

  // Save created users to localStorage
  const saveCreatedUsers = () => {
    try {
      localStorage.setItem("created_users", JSON.stringify(CREATED_USERS))
      console.log("Saved created users to localStorage:", CREATED_USERS.length)
    } catch (e) {
      console.log("Error saving created users to localStorage:", e)
    }
  }

  // Get all users - PRIORITIZE SUPABASE DATA
  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("🔍 Fetching all users...")

      // Try to fetch from Supabase first
      try {
        console.log("🔗 Attempting to fetch from Supabase...")

        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (!error && data && data.length > 0) {
          const supabaseUsers = data.map((profile) => ({
            id: profile.id,
            username: profile.username,
            name: profile.name,
            surname: profile.surname,
            role: profile.role as UserRole,
            department: profile.department,
            pageAccess: profile.page_access || [],
            email: profile.email || `${profile.username}@tswsmartlog.com`,
          }))

          console.log("✅ Fetched from Supabase:", supabaseUsers.length, "users")

          // Merge with created users (avoid duplicates)
          const mergedUsers = [...supabaseUsers]
          CREATED_USERS.forEach((createdUser) => {
            if (!mergedUsers.find((u) => u.email === createdUser.email)) {
              mergedUsers.push(createdUser)
            }
          })

          return mergedUsers
        }
      } catch (supabaseError) {
        console.log("⚠️ Supabase fetch failed, using local data:", supabaseError)
      }

      // Fallback to local data
      const allUsers = [...MOCK_USERS, ...CREATED_USERS]
      console.log("📝 Using local data:", {
        mockUsers: MOCK_USERS.length,
        createdUsers: CREATED_USERS.length,
        total: allUsers.length,
      })

      return allUsers
    } catch (error) {
      console.error("❌ Error in getUsers:", error)
      return [...MOCK_USERS, ...CREATED_USERS]
    }
  }

  // Create user function - HYBRID APPROACH: TRY SUPABASE + ALWAYS SAVE LOCALLY
  const createUser = async (userData: Omit<User, "id" | "username">): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🚀 Creating new user:", userData)

      // Generate username from name and surname
      const username = `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}`
      const email = userData.email || `${username}@tswsmartlog.com`

      // Create user object with temporary ID (will be replaced by auth user ID)
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        name: userData.name,
        surname: userData.surname,
        email: email,
        role: userData.role,
        department: userData.department,
        pageAccess:
          userData.pageAccess || (userData.role === "client" ? ["clientPortal", "shipmentTracker"] : ["dashboard"]),
      }

      // Try to create via API route first
      try {
        console.log("📝 Attempting to create via API route...")

        const authResponse = await fetch("/api/create-auth-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUser.email,
            password: userData.password || "TempPassword123!",
            userData: {
              username: newUser.username,
              name: newUser.name,
              surname: newUser.surname,
              role: newUser.role,
              department: newUser.department,
              page_access: newUser.pageAccess,
              email: newUser.email,
            },
          }),
        })

        if (authResponse.ok) {
          const result = await authResponse.json()
          console.log("✅ User created via API route:", result)

          // Update the user object with the real auth user ID
          newUser.id = result.user.id

          // Save locally with the correct ID
          CREATED_USERS.push(newUser)
          saveCreatedUsers()
          console.log("✅ User saved locally with auth ID:", newUser)
        } else {
          const error = await authResponse.text()
          console.error("❌ API route error:", error)

          // Fallback to local-only creation
          console.log("📝 Falling back to local-only creation...")
          CREATED_USERS.push(newUser)
          saveCreatedUsers()
          console.log("✅ User saved locally only:", newUser)
        }
      } catch (apiError) {
        console.error("❌ API call failed:", apiError)

        // Fallback to local-only creation
        console.log("📝 Falling back to local-only creation...")
        CREATED_USERS.push(newUser)
        saveCreatedUsers()
        console.log("✅ User saved locally only:", newUser)
      }

      // Send welcome email if requested
      if (userData.sendWelcomeEmail) {
        try {
          console.log("📧 Sending welcome email...")
          const emailResponse = await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: email,
              userName: userData.name,
              userSurname: userData.surname,
              temporaryPassword: userData.password || "TempPassword123!",
              companyName: userData.department,
              isClientUser: userData.role === "client",
            }),
          })

          if (emailResponse.ok) {
            console.log("✅ Welcome email sent successfully")
          } else {
            console.warn("⚠️ Welcome email failed to send")
          }
        } catch (emailError) {
          console.warn("⚠️ Error sending welcome email:", emailError)
        }
      }

      console.log("🎉 User created successfully!")
      return true
    } catch (error) {
      console.error("❌ Create user error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete user function - HYBRID APPROACH: DELETE FROM BOTH
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🗑️ Deleting user:", userId)

      // Delete from created users
      const userIndex = CREATED_USERS.findIndex((u) => u.id === userId)
      if (userIndex !== -1) {
        CREATED_USERS.splice(userIndex, 1)
        saveCreatedUsers()
        console.log("✅ User deleted from local storage")
      }

      // Try to delete from Supabase in background
      try {
        const { error } = await supabase.from("user_profiles").delete().eq("id", userId)

        if (!error) {
          console.log("✅ User also deleted from Supabase")
        } else {
          console.log("⚠️ Supabase delete failed (user still deleted locally):", error)
        }
      } catch (supabaseError) {
        console.log("⚠️ Supabase delete failed (user still deleted locally):", supabaseError)
      }

      return true
    } catch (error) {
      console.error("❌ Delete user error:", error)
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
