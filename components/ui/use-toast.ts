"use client"

import * as React from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive"
}

class ToastManager {
  private toasts: Toast[] = []
  private listeners: ((toasts: Toast[]) => void)[] = []

  addToast(toast: Omit<Toast, "id">) {
    const newToast: Toast = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9),
    }

    this.toasts.push(newToast)
    this.notifyListeners()

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(newToast.id)
    }, 5000)
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
    this.notifyListeners()
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  }
}

const toastManager = new ToastManager()

export const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
  toastManager.addToast({ title, description, variant })
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  React.useEffect(() => {
    return toastManager.subscribe(setToasts)
  }, [])

  return {
    toast,
    toasts,
    dismiss: (id: string) => toastManager.removeToast(id),
  }
}
