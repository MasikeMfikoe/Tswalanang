"use client"

import type React from "react"
import { toast } from "@/components/ui/use-toast"

// Error types
export enum ErrorType {
  API = "API_ERROR",
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NETWORK = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

// Error context
export interface ErrorContext {
  component?: string
  action?: string
  data?: any
}

// Error handler function
export function handleError(error: unknown, message?: string) {
  let errorMessage = message || "An unexpected error occurred."

  if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === "string") {
    errorMessage = error
  }

  console.error("Error:", errorMessage, error)

  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  })
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: unknown, message?: string) => {
      handleError(error, message)
    },
  }
}

// Error boundary component props
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
  component?: string
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
