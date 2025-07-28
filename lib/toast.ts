"use client"

// Create a simple toast implementation that doesn't depend on external components
// This avoids the circular dependency issues

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

// Create a simple toast function
const toast = (props: ToastProps) => {
  console.log("Toast:", props)
  // In a real implementation, this would show a toast notification
  // For now, we'll just log to console to avoid dependencies
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

// Create a hook that returns the toast function
export function useToast() {
  return {
    toast,
  }
}

// Also export the toast function directly
export { toast }
