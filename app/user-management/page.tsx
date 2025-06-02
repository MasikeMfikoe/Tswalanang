"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InternalUsersTab } from "./components/internal-users-tab"
import { ClientUsersTab } from "./components/client-users-tab"
import { PageHeader } from "@/components/ui/page-header"

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
          <InternalUsersTab />
        </TabsContent>
        <TabsContent value="client" className="mt-6">
          <ClientUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
