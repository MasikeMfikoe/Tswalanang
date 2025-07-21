import type React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ShipmentTrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Shipment Tracking</h1>
        <Link href="/dashboard" passHref>
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
