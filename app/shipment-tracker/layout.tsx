import type React from "react"
import { Navigation } from "@/components/Navigation"

export default function ShipmentTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">{children}</div>
    </div>
  )
}
