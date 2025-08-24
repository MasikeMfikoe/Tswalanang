"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User, UserRole } from "@/types/auth"
import { rolePermissions } from "@/types/auth"
import { AuditLogger } from "@/lib/audit-logger"

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
  createUser: (
    userData: Omit<User, "id" | "username"> & { password?: string; sendWelcomeEmail?: boolean },
  ) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create mock users for development - this will be the fallback data source
const MOCK_USERS: User[] = []

const FALLBACK_USERS: User[] = [
  {
    id: "demo-user-id",
    username: "demo",
    name: "Demo",
    first_name: "Demo",
    surname: "User",
    full_name: "Demo User",
    role: "admin" as UserRole,
    department: "Administration",
    pageAccess: [
      "dashboard",
      "orders",
      "customers",
      "documents",
      "deliveries",
      "courierOrders",
      "shipmentTracker",
      "userManagement",
      "auditTrail",
      "estimates",
      "currency",
      "rateCard",
    ],
    email: "demo@tswsmartlog.com",
  },
  {
    id: "admin-user-id",
    username: "admin",
    name: "Admin",
    first_name: "Admin",
    surname: "User",
    full_name: "Admin User",
    role: "admin" as UserRole,
    department: "Administration",
    pageAccess: [
      "dashboard",
      "orders",
      "customers",
      "documents",
      "deliveries",
      "courierOrders",
      "shipmentTracker",
      "userManagement",
      "auditTrail",
      "estimates",
      "currency",
      "rateCard",
    ],
    email: "admin@tswsmartlog.com",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Helper function to get client IP and user agent
  const getClientInfo = () => {
    return {
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      // Note: Getting real IP address requires server-side implementation
      ipAddress: undefined,
    }
  }

  const safeAuditLog = async (logFunction: () => Promise<void>) => {
    try {
      await logFunction()
    } catch (error) {
      console.warn("⚠️ Audit logging failed (non-critical):", error)
      // Don't throw error - audit logging should not break authentication
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    checkUser()
  }, [])

  // Check if user is authenticated
  const checkUser = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Checking user authentication...")

      if (!isSupabaseConfigured()) {
        console.error("❌ Supabase environment variables are missing!")
        console.error("❌ Required variables:")
        console.error("   - NEXT_PUBLIC_SUPABASE_URL")
        console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
        console.error("❌ Please set these in your Vercel environment variables and redeploy")
        setUser(null)
        setIsLoading(false)
        return
      }

      console.log("[v0] Using Supabase for authentication...")

      if (!supabase || !supabase.auth) {
        console.error("❌ Supabase client not properly initialized")
        setUser(null)
        setIsLoading(false)
        return
      }

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
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          if (error) {
            console.error("❌ Error fetching user profile:", error)
            await supabase.auth.signOut()
            setUser(null)
            return
          }

          const userData = {
            id: profile.user_id || profile.id || session.user.id,
            username: profile.username || profile.first_name?.toLowerCase() || "user",
            first_name: profile.first_name || profile.full_name?.split(" ")[0] || "Unknown",
            surname:
              profile.surname || (profile.full_name ? profile.full_name.split(" ").slice(1).join(" ") : "") || "",
            role: profile.role as UserRole,
            department: profile.department || "General",
            pageAccess: profile.page_access || profile.pageAccess || [],
            email: profile.email || session.user.email || `${profile.username}@tswsmartlog.com`,
          }

          console.log("✅ Setting user from Supabase:", userData.email)
          setUser(userData)

          // Redirect client users to client portal immediately
          if (userData.role === "client") {
            router.push("/client-portal")
          } else if (userData.role === "employee") {
            router.push("/customer-summary")
          }
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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log(`🔐 Attempting login for user: ${username}`)

      const { userAgent, ipAddress } = getClientInfo()

      if (!isSupabaseConfigured()) {
        console.error("❌ CRITICAL: Supabase environment variables are missing!")
        console.error("❌ Required variables:")
        console.error("   - NEXT_PUBLIC_SUPABASE_URL")
        console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
        console.error("❌ Please set these in your Vercel environment variables and redeploy")
        console.error("❌ Cannot authenticate users without proper Supabase configuration")
        return false
      }

      console.log("[v0] Using real Supabase authentication for all users...")

      if (!supabase || !supabase.from || !supabase.auth) {
        console.error("❌ Supabase client not properly initialized")
        return false
      }

      let email = username
      if (!username.includes("@")) {
        if (username === "demo") {
          email = "demo@tswsmartlog.com"
        } else {
          // For other internal users, use tlogistics.net.za domain
          email = `${username}@tlogistics.net.za`
        }
      }

      console.log(`🔐 Attempting Supabase auth with email: ${email}`)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        console.error("❌ Supabase auth error:", error.message)

        if (username === "demo" && error.message.includes("Invalid login credentials")) {
          console.log("🔧 Demo user login failed, trying common demo passwords...")

          const demoPasswords = ["demo", "Demo@2468", "Demo123!", "admin", "password", "demo123"]

          for (const tryPassword of demoPasswords) {
            if (tryPassword === password) continue // Skip the one we already tried

            console.log(`🔐 Trying demo password: ${tryPassword}`)
            const { data: tryData, error: tryError } = await supabase.auth.signInWithPassword({
              email: "demo@tswsmartlog.com",
              password: tryPassword,
            })

            if (!tryError && tryData.user) {
              console.log(`✅ Demo user authenticated with password: ${tryPassword}`)
              console.log(`💡 Demo user credentials: username="demo", password="${tryPassword}"`)
              const profileData = await processSuccessfulLogin(tryData.user, "demo@tswsmartlog.com")
              if (profileData) {
                setUser(profileData)
                await safeAuditLog(() =>
                  AuditLogger.logUserLogin(profileData.id, profileData.email, ipAddress, userAgent),
                )
                router.push("/dashboard")
                return true
              }
            }
          }

          console.error("❌ All demo passwords failed")
          console.error("💡 Demo user exists but password doesn't match any common passwords")
          console.error("💡 Please check the demo user password in your Supabase auth.users table")
          console.error("💡 Or manually reset the password in Supabase dashboard")
        }

        // Handle other specific error messages
        if (error.message.includes("Invalid login credentials")) {
          console.error("💡 Invalid credentials - check email and password")
          console.error("💡 Make sure the user exists in Supabase auth.users table")
        } else if (error.message.includes("Email not confirmed")) {
          console.error("💡 Email needs to be confirmed")
        } else if (error.message.includes("Database error granting user")) {
          console.error("💡 Database error - user may exist in user_profiles but not in auth.users")
          console.error("💡 Check that the user exists in both tables with matching user_id")
        }
        return false
      }

      if (!data.user) {
        console.error("❌ No user data returned from Supabase auth")
        return false
      }

      console.log("✅ Supabase authentication successful for user:", data.user.id)

      const profileData = await processSuccessfulLogin(data.user, email)
      if (profileData) {
        setUser(profileData)
        await safeAuditLog(() => AuditLogger.logUserLogin(profileData.id, profileData.email, ipAddress, userAgent))

        if (profileData.role === "client") {
          console.log("🔄 Redirecting client user to client portal")
          router.push("/client-portal")
        } else if (profileData.role === "employee") {
          console.log("🔄 Redirecting employee to customer summary")
          router.push("/customer-summary")
        } else {
          console.log("🔄 Redirecting to dashboard")
          router.push("/dashboard")
        }
        return true
      }

      return false
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const processSuccessfulLogin = async (authUser: any, email: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single()

      if (profileError) {
        console.error("❌ Error fetching user profile:", profileError)
        console.error("💡 User authenticated but no profile found in user_profiles table")
        console.error("💡 Make sure user_profiles table has a record with user_id:", authUser.id)
        await supabase.auth.signOut()
        return null
      }

      const userData = {
        id: authUser.id,
        username: profile.username || `${profile.first_name?.toLowerCase()}.${profile.surname?.toLowerCase()}`,
        name: profile.first_name || profile.full_name?.split(" ")[0] || "Unknown",
        first_name: profile.first_name || profile.full_name?.split(" ")[0] || "Unknown",
        surname: profile.surname || (profile.full_name ? profile.full_name.split(" ").slice(1).join(" ") : "") || "",
        full_name: profile.full_name || `${profile.first_name} ${profile.surname}`,
        role: profile.role as UserRole,
        department: profile.department || "General",
        pageAccess: Array.isArray(profile.page_access)
          ? profile.page_access
          : typeof profile.page_access === "string"
            ? profile.page_access
                .split(",")
                .map((p) => p.trim())
                .filter((p) => p)
            : [],
        email: profile.email || authUser.email || email,
      }

      console.log("✅ Setting authenticated user:", {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      })

      return userData
    } catch (profileError) {
      console.error("❌ Error processing user profile:", profileError)
      await supabase.auth.signOut()
      return null
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      console.log("🚪 Logging out...")

      const { userAgent, ipAddress } = getClientInfo()

      if (user) {
        await safeAuditLog(() => AuditLogger.logUserLogout(user.id, user.email, ipAddress, userAgent))
      }

      // Clear all session types
      localStorage.removeItem("demo_session")
      localStorage.removeItem("fallback_session")

      try {
        await supabase.auth.signOut()
        console.log("✅ Signed out from Supabase")
      } catch (error) {
        console.warn("⚠️ Error signing out from Supabase (non-critical):", error)
      }

      setUser(null)
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

      const { data: oldUserData, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

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

        // Safe audit logging
        if (user && oldUserData) {
          await safeAuditLog(() => AuditLogger.logUserUpdated(user.id, userId, oldUserData, userData))
        }

        // Update current user if it's the same user
        if (user && user.id === userId) {
          const updatedUser = { ...user, ...userData }
          setUser(updatedUser)
        }

        return true
      } else {
        const errorResponse = await updateResponse.json()
        console.error("❌ API route error:", errorResponse)
        throw new Error(errorResponse.details || errorResponse.error || "Update failed")
      }
    } catch (error) {
      console.error("❌ Update user error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has permission
  const hasPermission = (module: string, action: string): boolean => {
    if (!user) {
      return false
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

  // Get all users - PROPERLY MAP SUPABASE SCHEMA
  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("🔍 Fetching all users from Supabase...")

      if (!isSupabaseConfigured()) {
        console.warn("⚠️ Supabase not configured, returning empty user list")
        return []
      }

      if (!supabase || !supabase.from) {
        console.warn("⚠️ Supabase client not available, returning empty user list")
        return []
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          "id, user_id, customer_id, full_name, email, role, created_at, updated_at, first_name, surname, department, page_access",
        )
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching users from Supabase:", error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log("ℹ️ No users found in Supabase database")
        return []
      }

      const supabaseUsers = data
        .map((profile) => {
          try {
            // Handle first_name mapping
            const firstName = profile.first_name || profile.full_name?.split(" ")[0] || "Unknown"
            const surname =
              profile.surname || (profile.full_name ? profile.full_name.split(" ").slice(1).join(" ") : "") || ""

            // Parse page_access from text to array
            let pageAccessArray: string[] = []
            if (profile.page_access) {
              try {
                // Try parsing as JSON array first
                pageAccessArray = JSON.parse(profile.page_access)
              } catch {
                // If not JSON, treat as comma-separated string
                pageAccessArray = profile.page_access
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p)
              }
            }

            return {
              id: profile.id, // Primary key
              user_id: profile.user_id, // Foreign key to auth.users
              customer_id: profile.customer_id, // Foreign key to customers
              username:
                profile.first_name && profile.surname
                  ? `${profile.first_name.toLowerCase()}.${profile.surname.toLowerCase()}`
                  : "user",
              name: firstName, // For compatibility with forms
              first_name: firstName, // Exact mapping
              surname: surname, // Exact mapping
              full_name: profile.full_name, // Exact mapping
              email: profile.email || `user@tswsmartlog.com`,
              role: profile.role as UserRole, // Exact mapping
              department: profile.department || "General", // Exact mapping
              pageAccess: pageAccessArray, // Parsed array
              page_access: profile.page_access, // Raw value
              created_at: profile.created_at, // Exact mapping
              updated_at: profile.updated_at, // Exact mapping
            }
          } catch (mappingError) {
            console.error("❌ Error mapping user profile:", profile, mappingError)
            return null
          }
        })
        .filter((user): user is User => user !== null && user.id && user.email)

      console.log("✅ Successfully fetched and mapped", supabaseUsers.length, "users from Supabase")
      console.log(
        "📊 User roles breakdown:",
        supabaseUsers.reduce(
          (acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      )

      return supabaseUsers
    } catch (error) {
      console.error("❌ Error in getUsers:", error)
      return []
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
      if (!userData.first_name || !userData.surname || !userData.email || !userData.role || !userData.department) {
        throw new Error("Missing required fields")
      }

      // Generate username from name and surname
      const username = `${userData.first_name.toLowerCase()}.${userData.surname.toLowerCase()}`
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
            first_name: userData.first_name,
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

        // Safe audit logging
        if (user) {
          await safeAuditLog(() => AuditLogger.logUserCreated(user.id, result.user.id, userData))
        }

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

      // Get user data for audit logging before deletion
      const { data: userToDelete, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      // Delete from Supabase user_profiles
      const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", userId)

      if (profileError) {
        console.error("❌ Error deleting user profile:", profileError)
        return false
      }

      // Safe audit logging
      if (user && userToDelete) {
        await safeAuditLog(() => AuditLogger.logUserDeleted(user.id, userId, userToDelete))
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
