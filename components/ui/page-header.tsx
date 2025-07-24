// This file was left out for brevity. Assume it is correct and does not need any modifications.
// Placeholder content for components/ui/page-header.tsx
import type React from "react"
export function PageHeader({
  title,
  description,
  children,
}: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <p className="text-gray-600">{description}</p>}
      {children}
    </div>
  )
}
