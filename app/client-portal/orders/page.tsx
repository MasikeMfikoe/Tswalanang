/**
 * A tiny wrapper server component that dynamically loads the full client page.
 * Keeping this file minimal avoids huge chunks & ‘Loading chunk failed’ errors.
 */

"use client";

import dynamic from "next/dynamic";

const ClientPortalOrdersPage = dynamic(() => import("./ClientPortalOrdersPage"), {
  ssr: false,
});

export default function ClientWrapper() {
  return <ClientPortalOrdersPage />;
}
