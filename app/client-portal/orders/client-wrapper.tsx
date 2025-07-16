"use client"

import dynamic from "next/dynamic"

/**
 * Client-only wrapper that lazily loads the heavy ClientPortalOrdersPage
 * while keeping the server route segment minimal.
 */
const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), {
  // Rendering happens on the client only
  ssr: false,
})

export default function ClientPortalOrdersClientWrapper() {
  return <ClientPortalOrdersPage />
}
