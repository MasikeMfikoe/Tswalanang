"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  User,
  LogOut,
  Users,
  BarChart3,
  Search,
  Package,
  FileText,
  Truck,
  UserCheck,
  TrendingUp,
  DollarSign,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react"

// TypeScript interface for navigation items
interface NavigationItem {
  href?: string
  label: string
  icon: any
  pageKey?: string // Added pageKey to map navigation items to page access
  requiredPermission?: {
    module: string
    action: string
  }
  dropdown?: Array<{
    href: string
    label: string
    pageKey?: string // Added pageKey for dropdown items
    requiredPermission?: {
      module: string
      action: string
    }
  }>
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasPermission } = useAuth()
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>
  }

  if (!user) {
    return <>{children}</>
  }

  const isAdmin = user.role === "admin"
  const isClient = user.role === "client"

  const hasPageAccess = (pageKey: string) => {
    if (!user?.pageAccess || !Array.isArray(user.pageAccess) || user.pageAccess.length === 0) return true
    return user.pageAccess.includes(pageKey)
  }

  const navigationItems: NavigationItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      pageKey: "dashboard",
      requiredPermission: { module: "dashboard", action: "view" },
    },
    {
      href: "/shipment-tracker",
      label: "Shipment Tracker",
      icon: Search,
      pageKey: "shipmentTracker",
      requiredPermission: { module: "containerTracking", action: "view" },
    },
    {
      label: "Orders",
      icon: Package,
      pageKey: "orders",
      requiredPermission: { module: "orders", action: "view" },
      dropdown: [
        {
          href: "/orders",
          label: "Shipment Orders",
          pageKey: "orders",
          requiredPermission: { module: "orders", action: "view" },
        },
        {
          href: "/courier-orders",
          label: "Courier Orders",
          pageKey: "courierOrders",
          requiredPermission: { module: "courierOrders", action: "view" },
        },
      ],
    },
    {
      href: "/estimates",
      label: "Estimates",
      icon: FileText,
      pageKey: "estimates",
      requiredPermission: { module: "orders", action: "view" },
    },
    {
      label: "Documents",
      icon: FileText,
      pageKey: "documents",
      requiredPermission: { module: "documents", action: "view" },
      dropdown: [
        {
          href: "/documents",
          label: "All Documents",
          pageKey: "documents",
          requiredPermission: { module: "documents", action: "view" },
        },
        {
          href: "/documents/upload",
          label: "Upload Document",
          pageKey: "documents",
          requiredPermission: { module: "documents", action: "create" },
        },
      ],
    },
    {
      href: "/deliveries",
      label: "Deliveries",
      icon: Truck,
      pageKey: "deliveries",
      requiredPermission: { module: "deliveries", action: "view" },
    },
    {
      href: "/customers",
      label: "Customers",
      icon: UserCheck,
      pageKey: "customers",
      requiredPermission: { module: "customers", action: "view" },
    },
    {
      href: "/customer-summary",
      label: "Customer Summary",
      icon: TrendingUp,
      pageKey: "customers",
      requiredPermission: { module: "customers", action: "view" },
    },
    {
      href: "/currency",
      label: "Currency Conversion",
      icon: DollarSign,
      pageKey: "currency",
      requiredPermission: { module: "currencyConversion", action: "view" },
    },
    {
      href: "/rate-card",
      label: "Rate Card",
      icon: DollarSign,
      pageKey: "rateCard",
      requiredPermission: { module: "rateCard", action: "view" },
    },
    {
      href: "/audit-trail",
      label: "Audit Trail",
      icon: FileText,
      pageKey: "auditTrail",
      requiredPermission: { module: "auditTrail", action: "view" },
    },
    {
      href: "/edi-status-inputs",
      label: "EDI Status Inputs",
      icon: Settings,
      pageKey: "ediStatusInputs",
      requiredPermission: { module: "admin", action: "view" },
    },
    {
      href: "/user-management",
      label: "User Management",
      icon: User,
      pageKey: "userManagement",
      requiredPermission: { module: "admin", action: "view" },
    },
    {
      label: "Admin",
      icon: Settings,
      pageKey: "admin",
      requiredPermission: { module: "admin", action: "view" },
      dropdown: [
        {
          href: "/admin/settings",
          label: "Settings",
          pageKey: "admin",
          requiredPermission: { module: "admin", action: "view" },
        },
        {
          href: "/admin/user-groups",
          label: "User Groups",
          pageKey: "userManagement",
          requiredPermission: { module: "admin", action: "view" },
        },
        {
          href: "/user-management",
          label: "Users",
          pageKey: "userManagement",
          requiredPermission: { module: "admin", action: "view" },
        },
        {
          href: "/admin/tracking-users",
          label: "Tracking Users",
          pageKey: "userManagement",
          requiredPermission: { module: "admin", action: "view" },
        },
      ],
    },
  ]

  const filterDropdownItems = (dropdownItems: NavigationItem["dropdown"]) => {
    if (!dropdownItems || !Array.isArray(dropdownItems)) return []
    return dropdownItems.filter((item) => {
      if (item.requiredPermission) {
        const hasRolePermission = hasPermission(item.requiredPermission.module, item.requiredPermission.action)
        if (!hasRolePermission) return false
      }

      if (item.pageKey && !hasPageAccess(item.pageKey)) return false

      return true
    })
  }

  const getFilteredNavigationItems = () => {
    return navigationItems.filter((item) => {
      if (item.requiredPermission) {
        const hasRolePermission = hasPermission(item.requiredPermission.module, item.requiredPermission.action)
        if (!hasRolePermission) return false
      }

      if (item.pageKey && !hasPageAccess(item.pageKey)) return false

      if (item.dropdown) {
        const accessibleDropdownItems = filterDropdownItems(item.dropdown)
        return Array.isArray(accessibleDropdownItems) && accessibleDropdownItems.length > 0
      }

      return true
    })
  }

  const filteredNavigationItems = getFilteredNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={`bg-white shadow-lg border-r flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } ${isMobile ? `${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} fixed z-50 h-full` : "relative z-10 h-screen"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 ${isSidebarCollapsed ? "justify-center" : ""}`}
          >
            <img src="/images/TG_Logo-04.png" alt="TSW SmartLog" className="h-10 w-10 object-contain flex-shrink-0" />
            {!isSidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900">TSW SmartLog</span>
                <div className="text-xs text-gray-500 -mt-1">"smart logistics DMS"</div>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {filteredNavigationItems.map((item, index) => {
              if (item.dropdown) {
                const accessibleDropdownItems = filterDropdownItems(item.dropdown)

                return (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ${
                          isSidebarCollapsed ? "px-2" : ""
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48">
                      {accessibleDropdownItems.map((dropdownItem, dropdownIndex) => (
                        <DropdownMenuItem key={dropdownIndex} asChild>
                          <Link href={dropdownItem.href} className="flex items-center px-3 py-2 text-sm">
                            {dropdownItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Link
                  key={index}
                  href={item.href!}
                  className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        {isAdmin && hasPermission("clientPortal", "view") && (
          <div className="p-3 border-t">
            <Link
              href="/client-portal"
              className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                pathname === "/client-portal" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <>
                  <span>Client Portal</span>
                  <span className="text-xs opacity-75">(Admin)</span>
                </>
              )}
            </Link>
          </div>
        )}

        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 px-3 py-2 ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name} {user.surname}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                )}
                {!isSidebarCollapsed && <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isMobileMenuOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {!isClient && isMobile && (
          <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-bold text-gray-900">TSW SmartLog</span>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        )}

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
