import { PageHeader } from "@/components/ui/page-header"
import CreateOrder from "@/components/CreateOrder"

export default function CreateOrderPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Create New Order" description="Fill in the details to create a new logistics order." />
      <CreateOrder />
    </div>
  )
}
