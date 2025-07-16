"use client"

import dynamic from "next/dynamic"

/**
 * Dynamically import the heavy client page **without** server-side rendering.
 * Adjust the path if your original component lives elsewhere.
 */
const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), { ssr: false })

export default function ClientPortalOrdersWrapper() {
  return <ClientPortalOrdersPage />
}
