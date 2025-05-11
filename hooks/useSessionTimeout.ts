"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"

interface SessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onTimeout?: () => void
  onWarning?: () => void
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning,
}: SessionTimeoutOptions = {}) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [warningShown, setWarningShown] = useState<boolean>(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(timeoutMinutes * 60)

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  // Reset the timer when user activity is detected
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
    setWarningShown(false)
  }, [])

  // Extend the session
  const extendSession = useCallback(() => {
    resetTimer()
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    })
  }, [resetTimer, toast])

  // Check for timeout
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastActivity
      const remaining = Math.max(0, timeoutMs - elapsed)

      setTimeRemaining(Math.floor(remaining / 1000))

      // Show warning before timeout
      if (elapsed > timeoutMs - warningMs && !warningShown) {
        setWarningShown(true)
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${warningMinutes} minutes. Click to extend.`,
          action: {
            label: "Extend Session",
            onClick: extendSession,
          },
          duration: 0, // Don't auto-dismiss
        })
        onWarning?.()
      }

      // Logout on timeout
      if (elapsed >= timeoutMs) {
        logout()
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "destructive",
        })
        onTimeout?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user, lastActivity, timeoutMs, warningMs, warningShown, logout, toast, onWarning, onTimeout, extendSession])

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return

    const activityEvents = ["mousedown", "keypress", "scroll", "touchstart"]

    const handleActivity = () => {
      resetTimer()
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [user, resetTimer])

  return {
    timeRemaining,
    extendSession,
    isWarningShown: warningShown,
  }
}
