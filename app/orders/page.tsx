import { OrdersContent } from "@/components/OrdersContent"
import ProtectedRoute from "@/components/ProtectedRoute"
import { PageHeader } from "@/components/ui/page-header"

export default function OrdersPage() {
  return (
    <ProtectedRoute requiredPermission={{ module: "orders", action: "view" }}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageHeader
          title="Orders"
          description="Manage all customer orders and their statuses."
          showActionButton={true}
          actionButtonText="Create New Order"
          actionButtonLink="/orders/new"
        />
        <OrdersContent />
      </div>
    </ProtectedRoute>
  )
}
