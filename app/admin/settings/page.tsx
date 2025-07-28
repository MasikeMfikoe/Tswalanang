"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
      <div>API Key Manager</div>
    </div>
  )
}
