"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSafeToast } from "@/components/ui/toast-context"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, title, description, action, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "default" && "bg-background text-foreground",
          variant === "destructive" && "bg-destructive text-destructive-foreground",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {action && <div className="flex shrink-0">{action}</div>}
        <button
          onClick={() => props.onClose?.()}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  },
)

Toast.displayName = "Toast"

// Create a toast function that can be imported directly
export const toast = (props: ToastProps) => {
  // Get the toast function from context
  const { toast: addToast } = useSafeToast()

  // Call the toast function with the provided props
  addToast({
    ...props,
    duration: props.duration || 5000,
  })
}

// Add convenience methods
toast.success = (message: string, options?: Partial<Omit<ToastProps, "description">>) => {
  toast({
    title: "Success",
    description: message,
    variant: "default",
    duration: 3000,
    ...options,
  })
}

toast.error = (message: string, options?: Partial<Omit<ToastProps, "description">>) => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
    duration: 5000,
    ...options,
  })
}

toast.info = (message: string, options?: Partial<Omit<ToastProps, "description">>) => {
  toast({
    title: "Info",
    description: message,
    variant: "default",
    duration: 4000,
    ...options,
  })
}

toast.warning = (message: string, options?: Partial<Omit<ToastProps, "description">>) => {
  toast({
    title: "Warning",
    description: message,
    variant: "default",
    duration: 4000,
    ...options,
  })
}
