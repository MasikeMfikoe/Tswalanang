"use client"

import { useEffect } from "react"

import type React from "react"

// Simple monitoring and error tracking system

type ErrorData = {
  message: string
  stack?: string
  componentName?: string
  userId?: string
  timestamp: number
  url: string
  additionalData?: Record<string, any>
}

type PerformanceData = {
  name: string
  duration: number
  timestamp: number
  userId?: string
}

class Monitoring {
  private static instance: Monitoring
  private errors: ErrorData[] = []
  private performanceMetrics: PerformanceData[] = []
  private isEnabled = process.env.NODE_ENV === "production"

  private constructor() {
    // Initialize error listeners
    if (typeof window !== "undefined") {
      window.addEventListener("error", this.handleGlobalError.bind(this))
      window.addEventListener("unhandledrejection", this.handlePromiseRejection.bind(this))
    }
  }

  public static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring()
    }
    return Monitoring.instance
  }

  // Track errors
  public trackError(error: Error, componentName?: string, additionalData?: Record<string, any>): void {
    if (!this.isEnabled) return

    const errorData: ErrorData = {
      message: error.message,
      stack: error.stack,
      componentName,
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "",
      additionalData,
    }

    this.errors.push(errorData)
    this.sendErrorToServer(errorData)

    console.error(`[Monitoring] Error in ${componentName || "unknown"}:`, error)
  }

  // Track performance
  public trackPerformance(name: string, duration: number): void {
    if (!this.isEnabled) return

    const performanceData: PerformanceData = {
      name,
      duration,
      timestamp: Date.now(),
    }

    this.performanceMetrics.push(performanceData)
    this.sendPerformanceToServer(performanceData)
  }

  // Start timing an operation
  public startTimer(name: string): () => void {
    if (!this.isEnabled) return () => {}

    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.trackPerformance(name, duration)
    }
  }

  // Handle global errors
  private handleGlobalError(event: ErrorEvent): void {
    this.trackError(event.error || new Error(event.message), "global", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }

  // Handle unhandled promise rejections
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    this.trackError(error, "unhandledRejection")
  }

  // Send error to server (would implement actual API call in production)
  private sendErrorToServer(errorData: ErrorData): void {
    // In a real implementation, you would send this to your error tracking service
    // For example:
    // fetch('/api/monitoring/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(console.error);

    console.log("[Monitoring] Error tracked:", errorData)
  }

  // Send performance data to server
  private sendPerformanceToServer(performanceData: PerformanceData): void {
    // In a real implementation, you would send this to your monitoring service
    console.log("[Monitoring] Performance tracked:", performanceData)
  }
}

// Export singleton instance
export const monitoring = Monitoring.getInstance()

// React hook for component error boundaries
export function useErrorTracking(componentName: string) {
  return {
    trackError: (error: Error, additionalData?: Record<string, any>) => {
      monitoring.trackError(error, componentName, additionalData)
    },
  }
}

// Performance tracking HOC
export function withPerformanceTracking<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  name: string,
): React.FC<P> {
  return function WrappedComponent(props: P) {
    const endTimer = monitoring.startTimer(`render_${name}`)

    useEffect(() => {
      endTimer()
    }, [endTimer])

    return <Component {...props} />
  }
}
