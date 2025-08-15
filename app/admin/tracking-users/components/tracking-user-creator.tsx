"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function TrackingUserCreator() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    companyName: "",
    orderId: "", // Optional: to associate with specific orders
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const createTrackingUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email || `${userData.username}@example.com`,
        password: userData.password,
      })

      if (authError) throw authError

      // 2. Create user profile with tracking-only permissions
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: authData.user?.id,
        username: userData.username,
        name: userData.name,
        surname: userData.surname,
        role: "guest", // Using guest role with limited access
        department: userData.companyName,
        page_access: ["shipmentTracker"], // Only shipment tracker access
        company_name: userData.companyName,
        // If you want to associate specific orders with this user:
        associated_orders: userData.orderId ? [userData.orderId] : [],
      })

      if (profileError) throw profileError

      toast({
        title: "Tracking User Created",
        description: `Username: ${userData.username}, Password: ${userData.password}`,
        duration: 10000, // Longer duration so you can note the credentials
      })

      // Reset form
      setUserData({
        name: "",
        surname: "",
        username: "",
        email: "",
        password: "",
        companyName: "",
        orderId: "",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error Creating User",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Ensure the component returns JSX
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Tracking User</CardTitle>
        <CardDescription>Enter user details to create a tracking-only account.</CardDescription>
      </CardHeader>
      <CardContent>{/* Form fields here */}</CardContent>
      <CardFooter>
        <Button onClick={createTrackingUser} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </CardFooter>
    </Card>
  )
}
