// app/customers/[id]/rate-card/page.tsx
// (no "use client" here)

import RateCardClient from "./RateCardClient"

type PageParams = { id: string }

export default async function Page(
  { params }: { params: Promise<PageParams> }
) {
  const { id } = await params
  return <RateCardClient id={id} />
}
