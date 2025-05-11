import { EstimateForm } from "@/components/EstimateForm"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewEstimatePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Estimate</h1>
          <p className="text-muted-foreground">Create a new estimate for a customer</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/customers">Manage Customers</Link>
        </Button>
      </div>

      <EstimateForm />
    </div>
  )
}
