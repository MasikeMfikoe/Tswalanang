"use client"

import dynamic from "next/dynamic"
import { Spinner } from "@/components/ui/spinner"

const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  ),
})

export default function ClientPortalOrdersWrapper() {
  return <ClientPortalOrdersPage />
}
