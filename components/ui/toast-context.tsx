"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner" // Assuming sonner is used for toasts

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  variant?: "default" | "destructive"
  onClose?: () => void
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (props: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Create a safe version of useToast that doesn't throw errors
export function useSafeToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    // Return a no-op implementation if used outside provider
    return {
      toast: (props: Omit<ToastProps, "id">) => {},
      toasts: [],
      dismissToast: (id: string) => {},
    }
  }

  return {
    toast: context.addToast,
    toasts: context.toasts,
    dismissToast: context.removeToast,
  }
}

// Original useToast that throws errors (for development)
export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    console.warn("useToast must be used within a ToastProvider")
    // Return a no-op implementation if used outside provider
    return {
      toast: (props: Omit<ToastProps, "id">) => {},
      toasts: [],
      dismissToast: (id: string) => {},
    }
  }

  return {
    toast: context.addToast,
    toasts: context.toasts,
    dismissToast: context.removeToast,
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, ...props }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  // Auto-remove toasts after their duration
  React.useEffect(() => {
    const timers = toasts
      .map((toast) => {
        if (toast.duration !== Number.POSITIVE_INFINITY) {
          const timer = setTimeout(() => {
            removeToast(toast.id)
          }, toast.duration || 5000)
          return { id: toast.id, timer }
        }
        return null
      })
      .filter(Boolean) as { id: string; timer: NodeJS.Timeout }[]

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer.timer)
      })
    }
  }, [toasts, removeToast])

  const value = React.useMemo(() => {
    return {
      toasts,
      addToast,
      removeToast,
    }
  }, [toasts, addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastContext) || { toasts: [], removeToast: () => {} }

  if (!toasts.length) return null

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ id, title, description, action, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "default" && "bg-background text-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
      )}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action && <div className="flex shrink-0">{action}</div>}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
