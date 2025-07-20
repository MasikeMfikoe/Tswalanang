"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export function OrdersNavigation() {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">All Orders</h2>
      <Link href="/orders/new">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Order
        </Button>
      </Link>
    </div>
  )
}
