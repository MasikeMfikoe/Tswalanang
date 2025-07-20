"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function ServiceWorkerRegistration() {
  const { toast } = useToast()

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope)
            toast({
              title: "Offline Support Ready",
              description: "The application is now available offline.",
              variant: "success",
            })
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
            toast({
              title: "Offline Support Failed",
              description: "Could not register service worker for offline capabilities.",
              variant: "destructive",
            })
          })
      })
    }
  }, [toast])

  return null // This component doesn't render anything
}
