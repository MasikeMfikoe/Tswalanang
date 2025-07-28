import type React from "react"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Remove Navigation component - AppLayout handles all navigation now
  return <>{children}</>
}
