"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EstimateForm } from "@/components/EstimateForm"

export default function NewEstimatePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/estimates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Estimate</h1>
            <p className="text-muted-foreground">Create a new estimate for a customer</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/customers">Manage Customers</Link>
        </Button>
      </div>

      <EstimateForm />
    </div>
  )
}
