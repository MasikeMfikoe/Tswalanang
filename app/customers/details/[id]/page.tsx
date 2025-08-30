// app/customers/details/[id]/page.tsx
// (no "use client" here)

import CustomerDetailsClient from "./CustomerDetailsClient"

type PageParams = { id: string }

export default async function Page(
  { params }: { params: Promise<PageParams> }
) {
  const { id } = await params
  return <CustomerDetailsClient id={id} />
}

// optional metadata
export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
) {
  const { id } = await params
  return { title: `Customer ${id} · Details` }
}
