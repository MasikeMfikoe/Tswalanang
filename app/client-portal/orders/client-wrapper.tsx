"use client"

import dynamic from "next/dynamic"

/**
 * Client component that dynamically imports the heavy ClientPortalOrdersPage
 * with `ssr:false`, keeping the parent server component clean.
 */
const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), { ssr: false })

export default function ClientPortalOrdersWrapper() {
  return <ClientPortalOrdersPage />
}
