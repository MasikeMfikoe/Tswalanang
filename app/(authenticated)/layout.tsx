import type React from "react"
import { Navigation } from "@/components/Navigation"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-y-auto pt-16">{children}</main>
    </div>
  )
}
