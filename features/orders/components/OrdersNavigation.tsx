"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Package, Plus } from "lucide-react"

export default function OrdersNavigation({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = useState(pathname.startsWith("/orders"))

  return (
    <div className="mb-4">
      <Button
        variant={pathname.startsWith("/orders") ? "secondary" : "ghost"}
        className={cn("w-full justify-start", pathname.startsWith("/orders") && "bg-muted font-semibold")}
        onClick={() => setExpanded(!expanded)}
      >
        <Package className="mr-2 h-4 w-4" />
        Orders
        <span className="ml-auto">{expanded ? "▲" : "▼"}</span>
      </Button>

      {expanded && (
        <div className="pl-6 space-y-1 mt-1">
          <Link href="/orders">
            <Button
              variant={pathname === "/orders" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === "/orders" && "bg-muted font-semibold")}
              size="sm"
            >
              List Orders
            </Button>
          </Link>

          <Link href="/create-order">
            <Button
              variant={pathname === "/create-order" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === "/create-order" && "bg-muted font-semibold")}
              size="sm"
            >
              <Plus className="mr-2 h-3 w-3" />
              New Order
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
