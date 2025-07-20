import { PageHeader } from "@/components/ui/page-header"
import { OrdersContent } from "@/components/OrdersContent"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Orders" description="View and manage all logistics orders." />
      <OrdersContent />
    </div>
  )
}
