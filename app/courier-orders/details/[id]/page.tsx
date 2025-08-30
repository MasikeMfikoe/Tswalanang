// app/courier-orders/details/[id]/page.tsx
// (no "use client" here)

import CourierOrderDetailsClient from "./CourierOrderDetailsClient"

type PageParams = { id: string }

export default async function Page(
  { params }: { params: Promise<PageParams> }
) {
  const { id } = await params
  return <CourierOrderDetailsClient id={id} />
}
