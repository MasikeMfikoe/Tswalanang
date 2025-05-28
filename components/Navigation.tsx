"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Package,
  Truck,
  User,
  Currency,
  List,
  LogOut,
  Settings,
  LineChart,
  Search,
  BarChart2,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasPermission, signOut } = useAuth()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Close mobile menu when route changes
  useEffect(() => {
    // Close all menus when route changes
    setIsMobileMenuOpen(false)
    setIsSettingsOpen(false)
    setIsOrdersOpen(false)
    setIsDocumentsOpen(false)
    setIsProfileMenuOpen(false)
  }, [pathname])

  const toggleExpanded = (module: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [module]: !prev[module],
    }))
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
      module: "dashboard",
      current: pathname === "/dashboard",
    },
    {
      name: "Shipment Tracker",
      href: "/shipment-tracker",
      icon: Search,
      module: "shipmentTracker",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: Package,
      module: "orders",
      hasSubmenu: true,
      current: pathname === "/orders" || pathname?.startsWith("/orders/"),
      children: [
        { name: "Shipment Orders", href: "/orders" },
        { name: "Courier Orders", href: "/courier-orders" },
      ],
    },
    {
      name: "Estimates",
      href: "/estimates",
      icon: FileText,
      module: "estimates",
    },
    {
      name: "Documents",
      href: "/documents",
      icon: FileText,
      module: "documents",
      current: pathname === "/documents",
      children: [
        { name: "All Documents", href: "/documents" },
        { name: "Upload Document", href: "/documents/upload" },
      ],
    },
    {
      name: "Deliveries",
      href: "/deliveries",
      icon: Truck,
      module: "deliveries",
      current: pathname === "/deliveries",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: User,
      module: "customers",
      current: pathname === "/customers" || pathname?.startsWith("/customers/"),
    },
    {
      name: "Customer Summary",
      href: "/customer-summary",
      icon: LineChart,
      module: "customers",
    },
    {
      name: "Currency Conversion",
      href: "/currency",
      icon: Currency,
      module: "currencyConversion",
    },
    {
      name: "Audit Trail",
      href: "/audit-trail",
      icon: List,
      module: "auditTrail",
    },
    {
      name: "Rate Card",
      href: "/rate-card",
      icon: CreditCard,
      current: pathname === "/rate-card",
    },
    {
      name: "Admin",
      href: "/admin/settings",
      icon: Settings,
      module: "admin",
      hasSubmenu: true,
      current: pathname?.startsWith("/admin/"),
      children: [
        { name: "Settings", href: "/admin/settings" },
        { name: "User Groups", href: "/admin/user-groups" },
        { name: "Users", href: "/admin/users" },
        { name: "Tracking Users", href: "/admin/tracking-users" },
      ],
    },
  ]

  // Only render navigation when not on the landing page
  if (pathname === "/") {
    return null
  }

  // Check if user is a tracking-only user (guest with only shipmentTracker access)
  const isTrackingUser =
    user &&
    (user.role === "tracking" ||
      (user.role === "guest" && user.pageAccess.length === 1 && user.pageAccess.includes("shipmentTracker")))

  // If tracking user, only show the shipment tracker
  if (isTrackingUser) {
    return (
      <nav className="w-64 bg-white shadow-md flex flex-col h-screen">
        <div className="flex h-full flex-col gap-2">
          <div className="flex flex-col items-center justify-center h-[120px] border-b px-6 flex-shrink-0">
            <Link href="/shipment-tracker" className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <Image
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
                <Link href="/shipment-tracker">
                  <Button
                    variant={pathname === "/shipment-tracker" ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", pathname === "/shipment-tracker" && "bg-muted font-semibold")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Shipment Tracker
                  </Button>
                </Link>
              </div>
              <div className="mt-auto pt-4 border-t">
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
              </div>
            </nav>
          </div>
        </div>
      </nav>
    )
  }

  // For regular users, show the full navigation
  return (
    <nav className="bg-zinc-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Logo and desktop navigation */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-xl font-bold">TSW SmartLog</span>
              </Link>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {navItems.map(
                  (item) =>
                    hasPermission(item.module, "view") && (
                      <div key={item.name} className="relative">
                        {item.children ? (
                          <div>
                            <button
                              onClick={() => {
                                if (item.name === "Orders") setIsOrdersOpen(!isOrdersOpen)
                                if (item.name === "Documents") setIsDocumentsOpen(!isDocumentsOpen)
                                if (item.name === "Admin") setIsSettingsOpen(!isSettingsOpen)
                              }}
                              className={cn(
                                "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                                item.current
                                  ? "bg-zinc-800 text-white"
                                  : "text-gray-300 hover:bg-zinc-700 hover:text-white",
                              )}
                            >
                              <item.icon className="mr-2 h-5 w-5" />
                              {item.name}
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </button>
                            {/* Dropdown for Orders */}
                            {item.name === "Orders" && isOrdersOpen && (
                              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Dropdown for Documents */}
                            {item.name === "Documents" && isDocumentsOpen && (
                              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Dropdown for Admin */}
                            {item.name === "Admin" && isSettingsOpen && (
                              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                              item.current
                                ? "bg-zinc-800 text-white"
                                : "text-gray-300 hover:bg-zinc-700 hover:text-white",
                            )}
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ),
                )}
              </div>
            </div>
          </div>

          {/* Right side icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Search */}
            <button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-white">
              <span className="sr-only">Search</span>
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Notifications */}
            <button className="ml-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-white">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-white"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <User className="h-8 w-8 rounded-full bg-zinc-800 p-1" />
                </button>
              </div>
              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex={-1}
                >
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-0"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-1"
                  >
                    Settings
                  </a>
                  <button
                    onClick={signOut}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-2"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(
              (item) =>
                hasPermission(item.module, "view") && (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => {
                            if (item.name === "Orders") setIsOrdersOpen(!isOrdersOpen)
                            if (item.name === "Documents") setIsDocumentsOpen(!isDocumentsOpen)
                            if (item.name === "Admin") setIsSettingsOpen(!isSettingsOpen)
                          }}
                          className={cn(
                            "flex items-center w-full px-3 py-2 rounded-md text-base font-medium",
                            item.current
                              ? "bg-zinc-800 text-white"
                              : "text-gray-300 hover:bg-zinc-700 hover:text-white",
                          )}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.name}
                          {(item.name === "Orders" && isOrdersOpen) ||
                          (item.name === "Documents" && isDocumentsOpen) ||
                          (item.name === "Admin" && isSettingsOpen) ? (
                            <ChevronDown className="ml-auto h-5 w-5" />
                          ) : (
                            <ChevronRight className="ml-auto h-5 w-5" />
                          )}
                        </button>
                        {/* Mobile dropdown for Orders */}
                        {item.name === "Orders" && isOrdersOpen && (
                          <div className="pl-4 mt-2 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-zinc-700 hover:text-white"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {/* Mobile dropdown for Documents */}
                        {item.name === "Documents" && isDocumentsOpen && (
                          <div className="pl-4 mt-2 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-zinc-700 hover:text-white"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {/* Mobile dropdown for Admin */}
                        {item.name === "Admin" && isSettingsOpen && (
                          <div className="pl-4 mt-2 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-zinc-700 hover:text-white"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-base font-medium",
                          item.current ? "bg-zinc-800 text-white" : "text-gray-300 hover:bg-zinc-700 hover:text-white",
                        )}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
