// app/customer-summary/cargo-status/[id]/page.tsx
// (no "use client" here)

import CargoStatusClient from "./CargoStatusClient"

type PageParams = { id: string }

export default async function Page(
  { params }: { params: Promise<PageParams> }
) {
  const { id } = await params
  return <CargoStatusClient id={id} />
}
