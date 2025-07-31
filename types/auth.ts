"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient" // Corrected import path
import type { ReactNode } from "react"
import { defaultPermissions, type Permissions } from "@/lib/default-permissions" // Import defaultPermissions and Permissions type

export type UserRole = "admin" | "manager" | "employee" | "guest" | "client" | "tracking" // Added 'tracking' role

export const rolePermissions: Record<UserRole, Permissions> = {
  admin: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create: true, edit: true, delete: true },
    deliveries: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    currencyConversion: { view: true, create: true, edit: true, delete: true },
    containerTracking: { view: true, create: true, edit: true, delete: true },
    rateCard: { view: true, create: true, edit: true, delete: true },
    auditTrail: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true },
    courierOrders: { view: true, create: true, edit: true, delete: true },
    shipmentTracker: { view: true, create: true, edit: true, delete: true },
    clientPortal: { view: true, create: true, edit: true, delete: true },
    estimates: { view: true, create: true, edit: true, delete: true },
    userManagement: { view: true, create: true, edit: true, delete: true }, // Added userManagement
  },
  manager: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    documents: { view: true, create: true, edit: true, delete: false },
    deliveries: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: true, create: true, edit: true, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    estimates: { view: true, create: true, edit: true, delete: false },
    userManagement: { view: true, create: false, edit: false, delete: false }, // Added userManagement
  },
  employee: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: true, edit: false, delete: false },
    documents: { view: true, create: true, edit: false, delete: false },
    deliveries: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
    currencyConversion: { view: true, create: false, edit: false, delete: false },
    containerTracking: { view: true, create: false, edit: false, delete: false },
    rateCard: { view: true, create: false, edit: false, delete: false },
    auditTrail: { view: true, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: true, create: true, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    estimates: { view: true, create: true, edit: false, delete: false },
    userManagement: { view: false, create: false, edit: false, delete: false }, // Added userManagement
  },
  guest: defaultPermissions,
  tracking: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: false, create: false, edit: false, delete: false },
    estimates: { view: false, create: false, edit: false, delete: false },
    userManagement: { view: false, create: false, edit: false, delete: false }, // Added userManagement
  },
  client: {
    dashboard: { view: false, create: false, edit: false, delete: false },
    orders: { view: false, create: false, edit: false, delete: false },
    documents: { view: false, create: false, edit: false, delete: false },
    deliveries: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    currencyConversion: { view: false, create: false, edit: false, delete: false },
    containerTracking: { view: false, create: false, edit: false, delete: false },
    rateCard: { view: false, create: false, edit: false, delete: false },
    auditTrail: { view: false, create: false, edit: false, delete: false },
    admin: { view: false, create: false, edit: false, delete: false },
    courierOrders: { view: false, create: false, edit: false, delete: false },
    shipmentTracker: { view: true, create: false, edit: false, delete: false },
    clientPortal: { view: true, create: false, edit: false, delete: false },
    estimates: { view: false, create: false, edit: false, delete: false },
    userManagement: { view: false, create: false, edit: false, delete: false }, // Added userManagement
  },
}

export interface User {
  id: string
  name: string
  surname: string
  username: string
  email?: string
  department: string
  role: UserRole
  pageAccess: string[]
  password?: string
  associatedOrders?: string[]
}

export interface UserGroup {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  permissions?: GroupPermission[]
}

export interface GroupPermission {
  id: string
  groupId: string
  pagePath: string
  allowed: boolean
}

export interface AuthContextType {
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
  createUser: (
    userData: Omit<User, "id" | "username"> & { password?: string; sendWelcomeEmail?: boolean },
  ) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create mock users for development - this will be the fallback data source
export const MOCK_USERS: User[] = [
  // Exported for use in sync-mock-data API
  {
    id: "mock-user-id",
    username: "demo",
    name: "Demo",
    surname: "User",
    role: "admin",
    department: "IT",
    pageAccess: [
      "dashboard",
      "orders",
      "documents",
      "deliveries",
      "customers",
      "currencyConversion",
      "containerTracking",
      "rateCard",
      "auditTrail",
      "admin",
      "courierOrders",
      "shipmentTracker",
      "clientPortal",
      "estimates", // Added estimates to admin mock user
      "userManagement", // Added userManagement
    ],
    email: "demo@tswsmartlog.com",
  },
  {
    id: "mock-tracking-id",
    username: "tracking",
    name: "Tracking",
    surname: "User",
    role: "tracking", // Changed from guest to tracking
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
    pageAccess: [
      "dashboard",
      "orders",
      "customers",
      "deliveries",
      "courierOrders",
      "rateCard",
      "estimates",
      "userManagement",
    ], // Added estimates and userManagement
    email: "john.manager@tswsmartlog.com",
  },
  {
    id: "mock-employee-id",
    username: "employee",
    name: "Jane",
    surname: "Employee",
    role: "employee",
    department: "Customer Service",
    pageAccess: ["dashboard", "orders", "documents", "estimates"], // Added estimates
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkUser()
  }, [])

  // Check if user is authenticated
  const checkUser = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Checking user authentication...")

      // Check for session in Supabase
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("❌ Error getting session:", sessionError)
        setUser(null)
        setIsLoading(false)
        return
      }

      if (session) {
        console.log("✅ Found Supabase session:", session.user.id)

        try {
          // Get user profile from database
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("❌ Error fetching user profile:", error)
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

          console.log("✅ Setting user from Supabase:", userData.email)
          setUser(userData)
        } catch (error) {
          console.error("❌ Error processing user profile:", error)
          setUser(null)
        }
      } else {
        console.log("ℹ️ No Supabase session found")
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Error checking authentication:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Login function - PRIORITIZE SUPABASE AUTH
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log(`🔐 Attempting login for user: ${username}`)

      // First, try to find user by username in Supabase
      try {
        const { data: profiles, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("username", username)
          .single()

        if (!profileError && profiles) {
          console.log("✅ Found user profile, trying Supabase auth with email:", profiles.email)

          const { data, error } = await supabase.auth.signInWithPassword({
            email: profiles.email,
            password: password,
          })

          if (!error && data.user) {
            console.log("✅ Supabase authentication successful")

            // Set user with profile data
            const userData = {
              id: data.user.id,
              username: profiles.username,
              name: profiles.name,
              surname: profiles.surname,
              role: profiles.role as UserRole,
              department: profiles.department,
              pageAccess: profiles.page_access || [],
              email: profiles.email || data.user.email,
            }

            console.log("✅ Setting user from Supabase auth:", userData.email)
            setUser(userData)

            // Redirect client users to client portal immediately
            if (userData.role === "client") {
              router.push("/client-portal")
            }

            return true
          } else {
            console.log("❌ Supabase auth failed:", error?.message)
          }
        }
      } catch (supabaseError) {
        console.log("⚠️ Supabase profile lookup failed, trying mock fallback:", supabaseError)
      }

      // FALLBACK: Mock authentication for development
      const mockUser = MOCK_USERS.find((u) => u.username === username)
      if (mockUser) {
        console.log("🔄 Using mock login for user:", username)

        // Try Supabase auth with mock user email
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: mockUser.email,
            password: password,
          })

          if (!error && data.user) {
            console.log("✅ Mock user authenticated via Supabase")

            // Get or create profile
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", data.user.id)
              .single()

            if (!profileError && profile) {
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

              setUser(userData)
              if (userData.role === "client") {
                router.push("/client-portal")
              }
              return true
            }
          }
        } catch (mockAuthError) {
          console.log("⚠️ Mock user Supabase auth failed, using local auth:", mockAuthError)
        }

        // Final fallback to local mock authentication
        if (
          (username === "demo" && password === "demo") ||
          (username === "tracking" && password === "tracking") ||
          (username === "client1" && password === "client1") ||
          (username === "client2" && password === "client2")
        ) {
          console.log("✅ Using local mock authentication for:", username)
          setUser(mockUser)

          if (mockUser.role === "client") {
            router.push("/client-portal")
          }
          return true
        }
      }

      console.log("❌ Authentication failed for user:", username)
      return false
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      console.log("🚪 Logging out...")

      // Sign out from Supabase
      try {
        await supabase.auth.signOut()
        console.log("✅ Signed out from Supabase")
      } catch (error) {
        console.error("❌ Error signing out from Supabase:", error)
      }

      // Clear user state
      setUser(null)

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("📝 Registering new user:", userData.email)

      // This would typically create a user via API
      // For now, just return success
      return true
    } catch (error) {
      console.error("❌ Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update user function
  const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🔄 Updating user:", userId)

      // Try to update via API route
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

        // Update current user if it's the same user
        if (user && user.id === userId) {
          const updatedUser = { ...user, ...userData }
          setUser(updatedUser)
        }

        return true
      } else {
        const error = await updateResponse.text()
        console.error("❌ API route error:", error)
        return false
      }
    } catch (error) {
      console.error("❌ Update user error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission
  const hasPermission = (module: string, action: string): boolean => {
    if (!user) {
      return false
    }

    // If user has explicit pageAccess, use that. Otherwise, fall back to rolePermissions.
    // This prioritizes the granular pageAccess settings from the user profile.
    if (user.pageAccess && user.pageAccess.length > 0) {
      // For simplicity, if a module is in pageAccess, assume view permission.
      // More granular control would require storing action types in pageAccess.
      return user.pageAccess.includes(module)
    }

    const userRolePermissions = rolePermissions[user.role]
    if (!userRolePermissions) {
      return false
    }

    const modulePermissions = userRolePermissions[module]
    if (!modulePermissions) {
      return false
    }

    return modulePermissions[action as keyof typeof modulePermissions]
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    await checkUser()
  }

  // Get all users - PRIORITIZE SUPABASE DATA
  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("🔍 Fetching all users from Supabase...")

      const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching users from Supabase:", error)
        // Fallback to mock users
        console.log("🔄 Using mock users as fallback")
        return MOCK_USERS
      }

      if (!data || data.length === 0) {
        console.log("ℹ️ No users found in Supabase, using mock users")
        return MOCK_USERS
      }

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
      return supabaseUsers
    } catch (error) {
      console.error("❌ Error in getUsers:", error)
      console.log("🔄 Using mock users as fallback")
      return MOCK_USERS
    }
  }

  // Create user function
  const createUser = async (
    userData: Omit<User, "id" | "username"> & { password?: string; sendWelcomeEmail?: boolean },
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🚀 Creating new user:", userData.email)

      // Validate required fields
      if (!userData.name || !userData.surname || !userData.email || !userData.role || !userData.department) {
        throw new Error("Missing required fields")
      }

      // Generate username from name and surname
      const username = `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}`
      const email = userData.email
      const password = userData.password || `TempPass${Math.random().toString(36).slice(-8)}!`

      console.log("📡 Calling create-auth-user API...")

      const authResponse = await fetch("/api/create-auth-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          userData: {
            username: username,
            name: userData.name,
            surname: userData.surname,
            role: userData.role,
            department: userData.department,
            page_access:
              userData.role === "client" ? ["clientPortal", "shipmentTracker"] : userData.pageAccess || ["dashboard"],
            email: email,
          },
        }),
      })

      if (authResponse.ok) {
        const result = await authResponse.json()
        console.log("✅ User created via API route:", result)
        return true
      } else {
        const errorText = await authResponse.text()
        console.error("❌ API route error:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        // Handle specific error cases
        if (authResponse.status === 409) {
          throw new Error(errorData.details?.message || "User already exists with this email address")
        } else if (authResponse.status === 400 || authResponse.status === 422) {
          throw new Error(errorData.error || "Validation failed")
        }

        throw new Error("Failed to create user")
      }
    } catch (error) {
      console.error("❌ Create user error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Delete user function
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("🗑️ Deleting user:", userId)

      // Delete from Supabase user_profiles
      const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", userId)

      if (profileError) {
        console.error("❌ Error deleting user profile:", profileError)
        return false
      }

      // Try to delete from auth (this might fail if user doesn't exist in auth)
      try {
        // Note: This requires service role key, which we don't have in client
        // The deletion from auth should be handled by a server-side API route
        console.log("⚠️ Auth user deletion should be handled server-side")
      } catch (authError) {
        console.log("⚠️ Could not delete auth user (expected in client-side):", authError)
      }

      console.log("✅ User profile deleted from Supabase")
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
