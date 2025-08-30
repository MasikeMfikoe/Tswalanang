// app/orders/[id]/page.tsx
import OrderDetailsClient from "./OrderDetailsClient";

type PageParams = { id: string };

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;
  return <OrderDetailsClient id={id} />;
}
