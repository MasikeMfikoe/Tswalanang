"use client"

import dynamic from "next/dynamic"

const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), { ssr: false })

export default function OrdersRoute() {
  return <ClientPortalOrdersPage />
}
