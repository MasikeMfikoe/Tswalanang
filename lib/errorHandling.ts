"use client"

import type React from "react"

import { ApiError } from "./api/apiClient"
import { useToast } from "@/components/ui/use-toast"

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
export function handleError(
  error: unknown,
  context?: ErrorContext,
): { type: ErrorType; message: string; details?: any } {
  console.error("Error occurred:", error, context)

  // Default error information
  let type = ErrorType.UNKNOWN
  let message = "An unexpected error occurred"
  let details = undefined

  // Handle API errors
  if (error instanceof ApiError) {
    type = ErrorType.API
    message = error.message
    details = error.data

    // Handle specific HTTP status codes
    if (error.status === 401) {
      type = ErrorType.AUTHENTICATION
      message = "Authentication required. Please log in."
    } else if (error.status === 403) {
      type = ErrorType.AUTHORIZATION
      message = "You don't have permission to perform this action."
    } else if (error.status === 422) {
      type = ErrorType.VALIDATION
      message = "Validation error. Please check your input."
    }
  }
  // Handle network errors
  else if (error instanceof Error && error.name === "NetworkError") {
    type = ErrorType.NETWORK
    message = "Network error. Please check your internet connection."
  }
  // Handle other errors
  else if (error instanceof Error) {
    message = error.message
    details = error.stack
  }

  // Log to monitoring service (in a real app)
  // monitoring.trackError(error, context?.component, { ...context, type, message });

  return { type, message, details }
}

// React hook for error handling
export function useErrorHandler() {
  const { toast } = useToast()

  return {
    handleError: (error: unknown, context?: ErrorContext) => {
      const { type, message } = handleError(error, context)

      // Show toast notification
      toast({
        title: getErrorTitle(type),
        description: message,
        variant: "destructive",
      })

      return { type, message }
    },
  }
}

// Helper function to get error title based on type
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.API:
      return "API Error"
    case ErrorType.VALIDATION:
      return "Validation Error"
    case ErrorType.AUTHENTICATION:
      return "Authentication Error"
    case ErrorType.AUTHORIZATION:
      return "Authorization Error"
    case ErrorType.NETWORK:
      return "Network Error"
    case ErrorType.UNKNOWN:
    default:
      return "Error"
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
