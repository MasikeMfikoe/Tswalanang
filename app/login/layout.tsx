import type React from "react"
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-zinc-900 flex items-center justify-center">{children}</div>
}
