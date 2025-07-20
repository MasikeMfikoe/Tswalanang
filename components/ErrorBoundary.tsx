"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="flex flex-col items-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-red-600">Something went wrong!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We're sorry, but an unexpected error occurred in this component. Please try reloading the page or
                contact support if the issue persists.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-left p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
                  <p className="font-semibold">Error Details:</p>
                  <pre className="whitespace-pre-wrap break-all">{this.state.error.message}</pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary>Component Stack</summary>
                      <pre className="whitespace-pre-wrap break-all text-xs">{this.state.errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              )}
              <Button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
