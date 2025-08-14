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

      if (authError) throw new authError()

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
      console.error("Error creating tracking user:", error)
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Tracking-Only User</CardTitle>
        <CardDescription>Create a user with restricted access to only track and trace functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={createTrackingUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">First Name</Label>
              <Input id="name" name="name" value={userData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Last Name</Label>
              <Input id="surname" name="surname" value={userData.surname} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={userData.username} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="If blank, will use username@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={userData.companyName} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID (Optional)</Label>
            <Input
              id="orderId"
              name="orderId"
              value={userData.orderId}
              onChange={handleChange}
              placeholder="Associate with a specific order"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Tracking User"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>This user will only have access to the shipment tracker functionality.</p>
        <p>They will only be able to view orders associated with their account.</p>
      </CardFooter>
    </Card>
  )
}
