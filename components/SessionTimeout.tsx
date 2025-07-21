"use client"
import { useEffect, useRef, useState, useCallback } from "react"
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
import { Button } from "@/components/ui/button"

interface SessionTimeoutProps {
  timeoutMinutes?: number // Default to 30 minutes
  warningMinutes?: number // Default to 5 minutes before timeout
  logoutPath?: string // Path to redirect on logout
}

export function SessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  logoutPath = "/login",
}: SessionTimeoutProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimers = useCallback(() => {
    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)

    // Set warning timer
    warningTimeoutRef.current = setTimeout(
      () => {
        setShowWarning(true)
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
          variant: "warning",
          duration: (warningMinutes - 1) * 60 * 1000, // Show for most of the warning period
        })
      },
      (timeoutMinutes - warningMinutes) * 60 * 1000,
    )

    // Set logout timer
    timeoutRef.current = setTimeout(
      () => {
        setShowLogoutDialog(true)
        // Optionally, force logout immediately if no interaction after warning
        // router.push(logoutPath);
        // toast({
        //   title: "Session Expired",
        //   description: "You have been logged out due to inactivity.",
        //   variant: "destructive",
        // });
      },
      timeoutMinutes * 60 * 1000,
    )
  }, [timeoutMinutes, warningMinutes, toast, logoutPath])

  const handleActivity = useCallback(() => {
    setShowWarning(false)
    setShowLogoutDialog(false)
    resetTimers()
  }, [resetTimers])

  const handleStayLoggedIn = () => {
    setShowLogoutDialog(false)
    // Here you would typically make an API call to refresh the session token
    // For this example, we'll just reset timers.
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    })
    resetTimers()
  }

  const handleLogout = () => {
    setShowLogoutDialog(false)
    router.push(logoutPath)
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    })
  }

  useEffect(() => {
    resetTimers()

    // Add event listeners for user activity
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("click", handleActivity)
    window.addEventListener("scroll", handleActivity)

    return () => {
      // Clean up timers and event listeners
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("click", handleActivity)
      window.removeEventListener("scroll", handleActivity)
    }
  }, [handleActivity, resetTimers])

  return (
    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired due to inactivity. Please log in again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleStayLoggedIn}>Stay Logged In</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
