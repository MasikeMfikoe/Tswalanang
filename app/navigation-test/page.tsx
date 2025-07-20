"use client"

import { NavigationTest } from "@/components/NavigationTest"

export default function NavigationTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Navigation Test Page</h1>
      <p className="mb-6">This page is for testing navigation links and ensuring they work correctly.</p>
      <NavigationTest />
    </div>
  )
}
