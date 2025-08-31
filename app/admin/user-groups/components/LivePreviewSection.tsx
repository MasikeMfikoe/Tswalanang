"use client"

import type { GroupPermission } from "@/types/auth"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Package,
  FileText,
  Settings,
  Calendar,
  Layout,
  Users,
  CreditCard,
  Ticket,
  Plus,
  List,
} from "lucide-react"

interface LivePreviewSectionProps {
  navigationStructure: any[]
  permissions: GroupPermission[]
}

// Safely extract a path and "allowed" flag from possibly different shapes
const getPermissionForPath = (permissions: GroupPermission[], path: string) => {
  const list = permissions as unknown as Array<any>
  return list.find((p) => {
    const permPath = p?.pagePath ?? p?.path ?? p?.route ?? p?.key ?? p?.slug
    return permPath === path
  })
}

const isAllowedFlag = (perm: any): boolean =>
  Boolean(perm?.allowed ?? perm?.canAccess ?? perm?.enabled ?? false)

export default function LivePreviewSection({ navigationStructure, permissions }: LivePreviewSectionProps) {
  const isPathAllowed = (path: string) => {
    const perm = getPermissionForPath(permissions, path)
    return isAllowedFlag(perm)
  }

  // Map icon names to actual Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "BarChart":
        return <BarChart className="h-4 w-4" />
      case "Package":
        return <Package className="h-4 w-4" />
      case "FileText":
        return <FileText className="h-4 w-4" />
      case "Settings":
        return <Settings className="h-4 w-4" />
      case "Calendar":
        return <Calendar className="h-4 w-4" />
      case "Layout":
        return <Layout className="h-4 w-4" />
      case "Users":
        return <Users className="h-4 w-4" />
      case "CreditCard":
        return <CreditCard className="h-4 w-4" />
      case "Ticket":
        return <Ticket className="h-4 w-4" />
      case "Plus":
        return <Plus className="h-4 w-4" />
      case "List":
        return <List className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const renderNavigationItem = (item: any, depth = 0) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const allowed = isPathAllowed(item.path)
    if (!allowed) return null

    return (
      <div key={item.path} className="space-y-1">
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm",
            depth === 0 ? "bg-accent" : "hover:bg-accent ml-4",
          )}
        >
          {getIcon(item.icon)}
          <span className="ml-2">{item.name}</span>
        </div>

        {hasChildren && (
          <div className="space-y-1">
            {item.children
              .filter((child: any) => isPathAllowed(child.path))
              .map((child: any) => renderNavigationItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This is a preview of how the navigation menu will appear to users in this group.
      </p>

      <Card className="w-64 shadow-md">
        <CardContent className="p-2 space-y-1">
          {navigationStructure
            .filter((item) => isPathAllowed(item.path))
            .map((item) => renderNavigationItem(item))}
        </CardContent>
      </Card>
    </div>
  )
}
