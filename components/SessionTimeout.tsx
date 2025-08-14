"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStableId } from "@/lib/react-compatibility"

interface SessionTimeoutProps {
  timeout?: number // in milliseconds
  warningTime?: number // in milliseconds before timeout
  onTimeout?: () => void
}

// Component implementation
export function SessionTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 5 * 60 * 1000, // 5 minutes warning default
  onTimeout = () => {},
}: SessionTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(warningTime / 1000)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const router = useRouter()
  const dialogId = useStableId()

  // Reset timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now())
    setShowWarning(false)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    // Track user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    const handleUserActivity = () => {
      resetTimer()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    // Check session status
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity

      if (timeSinceLastActivity >= timeout - warningTime && !showWarning) {
        // Show warning dialog
        setShowWarning(true)
        setTimeLeft(Math.ceil(warningTime / 1000))
      } else if (timeSinceLastActivity >= timeout) {
        // Session timeout
        clearInterval(interval)
        onTimeout()
      }
    }, 1000)

    // Countdown timer for warning dialog
    let countdownInterval: NodeJS.Timeout | null = null

    if (showWarning) {
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval as NodeJS.Timeout)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      clearInterval(interval)
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [lastActivity, timeout, warningTime, showWarning, onTimeout])

  const handleStayLoggedIn = () => {
    resetTimer()
  }

  const handleLogout = () => {
    onTimeout()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning} id={dialogId}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Your session will expire in <span className="font-bold">{formatTime(timeLeft)}</span> due to inactivity.
          </p>
          <p>Would you like to stay logged in?</p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleStayLoggedIn}>Stay Logged In</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Also export as default for backward compatibility
export default SessionTimeout
