"use client"

/**
 * Client component that lazily loads the heavy ClientPortalOrdersPage
 * while disabling SSR to avoid large server bundles.
 */
import dynamic from "next/dynamic"

const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), { ssr: false })

export default function OrdersPageLoader() {
  return <ClientPortalOrdersPage />
}
