"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navigation } from "./Navigation"
import { SessionTimeout } from "./SessionTimeout"
import { useAuth } from "@/contexts/AuthContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show navigation only on login page and delivery confirmation pages
  const isLoginPage = pathname === "/login"
  const isPublicPage =
    pathname === "/delivery-confirmation/success" ||
    pathname?.startsWith("/delivery-confirmation/") ||
    pathname === "/tracking-welcome"
  // Removed shipment tracker from public pages to show navigation on it

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoginPage && !isPublicPage && user && <Navigation />}
      <main className={`flex-grow ${!isLoginPage && !isPublicPage && user ? "pt-16" : ""}`}>{children}</main>
      {user && <SessionTimeout onTimeout={signOut} />}
    </div>
  )
}
