/**
 * A tiny wrapper server component that dynamically loads the full client page.
 * Keeping this file minimal avoids huge chunks & ‘Loading chunk failed’ errors.
 */

import ClientPortalOrdersClientWrapper from "./client-wrapper"

export default function OrdersRoute() {
  return <ClientPortalOrdersClientWrapper />
}
