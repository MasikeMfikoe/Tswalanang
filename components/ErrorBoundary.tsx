"use client"

import React from "react"
import { type ErrorBoundaryProps, type ErrorBoundaryState, handleError } from "@/lib/errorHandling"
import { ErrorDisplay } from "@/components/ErrorDisplay"

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the error to an error reporting service
    const { component, onError } = this.props

    handleError(error, {
      component,
      action: "render",
      data: { componentStack: info.componentStack },
    })

    if (onError) {
      onError(error, info)
    }
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback
      }

      return <ErrorDisplay title="Something went wrong" message={error?.message || "An unexpected error occurred"} />
    }

    return children
  }
}

// Functional component wrapper for ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const displayName = Component.displayName || Component.name || "Component"

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} component={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}
