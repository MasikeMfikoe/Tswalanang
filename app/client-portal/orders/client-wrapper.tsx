"use client"

import dynamic from "next/dynamic"

// Dynamically import ClientPortalOrdersPage with ssr: false
const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), {
  ssr: false,
})

export default function ClientPortalOrdersPageWrapper() {
  return <ClientPortalOrdersPage />
}
