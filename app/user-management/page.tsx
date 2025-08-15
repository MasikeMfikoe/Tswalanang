"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InternalUsersTab } from "./components/internal-users-tab"
import { ClientUsersTab } from "./components/client-users-tab"
import { PageHeader } from "@/components/ui/page-header"

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>
  } catch (error) {
    console.log("[v0] Error boundary caught:", error)
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-medium">Something went wrong</h3>
        <p className="text-red-600 text-sm mt-1">Please refresh the page to try again.</p>
      </div>
    )
  }
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("internal")

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="User Management" description="Manage internal organization users and external client users" />

      <Tabs defaultValue="internal" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="internal">Users</TabsTrigger>
          <TabsTrigger value="client">Client Users</TabsTrigger>
        </TabsList>
        <TabsContent value="internal" className="mt-6">
          <ErrorBoundary>
            <InternalUsersTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="client" className="mt-6">
          <ErrorBoundary>
            <ClientUsersTab />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
