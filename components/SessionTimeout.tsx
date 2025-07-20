"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SessionTimeoutProps {
  timeoutMinutes?: number // Default to 30 minutes
  countdownMinutes?: number // How many minutes before timeout to show warning
  onLogout?: () => void // Callback for custom logout logic
}

export function SessionTimeout({ timeoutMinutes = 30, countdownMinutes = 5, onLogout }: SessionTimeoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(countdownMinutes * 60) // in seconds

  const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalIdRef = React.useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }
    if (countdownIntervalIdRef.current) {
      clearInterval(countdownIntervalIdRef.current)
    }
    setShowWarning(false)
    setCountdown(countdownMinutes * 60)

    // Set main timeout
    timeoutIdRef.current = setTimeout(
      () => {
        setShowWarning(true)
        startCountdown()
      },
      (timeoutMinutes - countdownMinutes) * 60 * 1000,
    )
  }

  const startCountdown = () => {
    countdownIntervalIdRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalIdRef.current!)
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout action: redirect to login
      router.push("/login?sessionExpired=true")
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive",
      })
    }
    setShowWarning(false)
    clearTimers()
  }

  const handleStayLoggedIn = () => {
    // Simulate refreshing session (e.g., by making an API call)
    // In a real app, you'd hit an endpoint that refreshes the session token
    console.log("Refreshing session...")
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    })
    resetTimer()
  }

  const clearTimers = () => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
    if (countdownIntervalIdRef.current) clearInterval(countdownIntervalIdRef.current)
  }

  useEffect(() => {
    resetTimer()

    const events = ["load", "mousemove", "mousedown", "click", "scroll", "keypress"]
    events.forEach((event) => window.addEventListener(event, resetTimer))

    return () => {
      clearTimers()
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [timeoutMinutes, countdownMinutes, onLogout]) // Re-run if these props change

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session About to Expire</AlertDialogTitle>
          <AlertDialogDescription>
            You will be logged out in {formatTime(countdown)} due to inactivity. Do you want to stay logged in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>Log Out</AlertDialogCancel>
          <AlertDialogAction onClick={handleStayLoggedIn}>Stay Logged In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
