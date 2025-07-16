"use client"

/**
 * Hosts the dynamic import of the heavy client-only page so
 * the server component stays 100 % compliant.
 */
import dynamic from "next/dynamic"

const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), { ssr: false })

export default function OrdersClientWrapper() {
  return <ClientPortalOrdersPage />
}
