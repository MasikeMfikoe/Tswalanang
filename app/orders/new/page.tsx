import CreateOrder from "@/components/CreateOrder"
import ProtectedRoute from "@/components/ProtectedRoute"
import { PageHeader } from "@/components/ui/page-header"

export default function NewOrderPage() {
  return (
    <ProtectedRoute requiredPermission={{ module: "orders", action: "create" }}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageHeader title="Create New Order" description="Fill in the details to create a new customer order." />
        <CreateOrder />
      </div>
    </ProtectedRoute>
  )
}
