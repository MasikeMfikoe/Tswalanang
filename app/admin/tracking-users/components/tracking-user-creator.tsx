"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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

      // Additional code can be added here if needed
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Tracking User</CardTitle>
        <CardDescription>Enter user details to create a new tracking user.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createTrackingUser}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={userData.name} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" name="surname" value={userData.surname} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={userData.username} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={userData.email} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={userData.password} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" value={userData.companyName} onChange={handleChange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="orderId">Order ID (Optional)</Label>
              <Input id="orderId" name="orderId" value={userData.orderId} onChange={handleChange} />
            </div>
          </div>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
