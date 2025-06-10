"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  FileText,
  Truck,
  User,
  Currency,
  List,
  LogIn,
  LogOut,
  Home,
  Settings,
  Calculator,
  Users,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import OrdersNavigation from "@/features/orders/components/OrdersNavigation"

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasPermission } = useAuth()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpanded = (module: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  // Debug output
  console.log("Current user:", user)
  const isAdmin = user?.role === "admin"
  console.log("Is admin:", isAdmin)

  return (
    <nav className="w-64 bg-white shadow-md flex flex-col h-screen">
      <div className="flex h-full flex-col gap-2">
        <div className="flex flex-col items-center justify-center h-[120px] border-b px-6 flex-shrink-0">
          <Link href="/dashboard" className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
                alt="TSW SmartLog Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">TSW SmartLog</span>
                <span className="text-sm text-muted-foreground">"smart logistics DMS"</span>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <div className="space-y-1">
              <Link href="/dashboard">
                <Button
                  variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", pathname === "/dashboard" && "bg-muted font-semibold")}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <OrdersNavigation pathname={pathname} />

              {hasPermission("documents", "view") && (
                <Link href="/documents">
                  <Button
                    variant={pathname === "/documents" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/documents" && "bg-muted font-semibold")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </Button>
                </Link>
              )}

              {hasPermission("deliveries", "view") && (
                <Link href="/deliveries">
                  <Button
                    variant={pathname === "/deliveries" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/deliveries" && "bg-muted font-semibold")}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Deliveries
                  </Button>
                </Link>
              )}

              {hasPermission("courierOrders", "view") && (
                <Link href="/courier-orders">
                  <Button
                    variant={pathname === "/courier-orders" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/courier-orders" && "bg-muted font-semibold")}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Courier Orders
                  </Button>
                </Link>
              )}

              {hasPermission("customers", "view") && (
                <Link href="/customers">
                  <Button
                    variant={pathname === "/customers" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/customers" && "bg-muted font-semibold")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customers
                  </Button>
                </Link>
              )}

              {hasPermission("currencyConversion", "view") && (
                <Link href="/currency">
                  <Button
                    variant={pathname === "/currency" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/currency" && "bg-muted font-semibold")}
                  >
                    <Currency className="mr-2 h-4 w-4" />
                    Currency Conversion
                  </Button>
                </Link>
              )}

              {hasPermission("rateCard", "view") && (
                <Link href="/rate-card">
                  <Button
                    variant={pathname === "/rate-card" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/rate-card" && "bg-muted font-semibold")}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Rate Card
                  </Button>
                </Link>
              )}

              {hasPermission("auditTrail", "view") && (
                <Link href="/audit-trail">
                  <Button
                    variant={pathname === "/audit-trail" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/audit-trail" && "bg-muted font-semibold")}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Audit Trail
                  </Button>
                </Link>
              )}

              {hasPermission("admin", "view") && (
                <Link href="/admin/users">
                  <Button
                    variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/admin/users" && "bg-muted font-semibold")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              {/* HARDCODED CLIENT PORTAL LINK FOR ADMIN */}
              {isAdmin && (
                <Link href="/client-portal">
                  <Button
                    variant={pathname.startsWith("/client-portal") ? "secondary" : "ghost"}
                    className="w-full justify-start bg-blue-50 hover:bg-blue-100 border border-blue-200"
                  >
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-blue-700">Client Portal View</span>
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-auto pt-4 border-t">
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    logout()
                    router.push("/login")
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Landing Page
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  )
}
