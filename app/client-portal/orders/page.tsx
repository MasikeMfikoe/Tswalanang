/**
 * Server component route - delegates rendering to a tiny
 * client wrapper so we can use `dynamic(..., { ssr:false })`
 * without violating the server-component rules.
 */

import OrdersPageLoader from "./orders-page-loader"

export default function OrdersRoute() {
  return <OrdersPageLoader />
}
