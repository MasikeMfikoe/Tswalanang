// app/delivery-confirmation/[id]/page.tsx
import DeliveryConfirmationClient from "./DeliveryConfirmationClient"

type PageParams = { id: string }
type PageSearch = { token?: string | string[] }

export default async function Page(
  { params, searchParams }: { params: Promise<PageParams>; searchParams: Promise<PageSearch> }
) {
  const { id } = await params
  const sp = await searchParams

  const tokenRaw = sp?.token
  const token =
    typeof tokenRaw === "string"
      ? tokenRaw
      : Array.isArray(tokenRaw)
      ? tokenRaw[0] ?? ""
      : ""

  return <DeliveryConfirmationClient id={id} token={token} />
}
