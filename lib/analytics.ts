"use client"

// This is a simple analytics module that can be expanded or replaced with a real analytics service

type EventType = "page_view" | "click" | "form_submit" | "error" | "api_call" | "login" | "logout" | "custom"

interface AnalyticsEvent {
  type: EventType
  name: string
  properties?: Record<string, any>
  timestamp: number
}

interface UserProperties {
  userId?: string
  username?: string
  role?: string
  department?: string
}

class Analytics {
  private static instance: Analytics
  private events: AnalyticsEvent[] = []
  private userProperties: UserProperties = {}
  private isEnabled = process.env.NODE_ENV === "production"
  private flushInterval: NodeJS.Timeout | null = null
  private flushIntervalMs = 30000 // 30 seconds

  private constructor() {
    if (typeof window !== "undefined") {
      // Set up automatic flushing of events
      this.flushInterval = setInterval(() => {
        this.flush()
      }, this.flushIntervalMs)

      // Flush events on page unload
      window.addEventListener("beforeunload", () => {
        this.flush()
      })
    }
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  public setUser(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties }
  }

  public clearUser(): void {
    this.userProperties = {}
  }

  public trackEvent(type: EventType, name: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return

    const event: AnalyticsEvent = {
      type,
      name,
      properties: { ...properties, ...this.userProperties },
      timestamp: Date.now(),
    }

    this.events.push(event)
    console.log(`[Analytics] Tracked event: ${type} - ${name}`, event)

    // If we have too many events, flush them
    if (this.events.length >= 20) {
      this.flush()
    }
  }

  public trackPageView(path: string): void {
    this.trackEvent("page_view", "Page View", { path })
  }

  public trackClick(elementId: string, elementText?: string): void {
    this.trackEvent("click", "Element Click", { elementId, elementText })
  }

  public trackFormSubmit(formId: string, formData?: Record<string, any>): void {
    // Remove sensitive data
    const safeFormData = formData ? this.sanitizeData(formData) : undefined
    this.trackEvent("form_submit", "Form Submit", { formId, formData: safeFormData })
  }

  public trackError(error: Error, componentName?: string): void {
    this.trackEvent("error", "Error", {
      message: error.message,
      stack: error.stack,
      componentName,
    })
  }

  public trackApiCall(endpoint: string, method: string, status: number, duration: number): void {
    this.trackEvent("api_call", "API Call", { endpoint, method, status, duration })
  }

  public trackLogin(userId: string, username: string): void {
    this.setUser({ userId, username })
    this.trackEvent("login", "User Login", { userId, username })
  }

  public trackLogout(): void {
    const { userId, username } = this.userProperties
    this.trackEvent("logout", "User Logout", { userId, username })
    this.clearUser()
  }

  public trackCustomEvent(name: string, properties?: Record<string, any>): void {
    this.trackEvent("custom", name, properties)
  }

  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ["password", "token", "secret", "credit_card", "card_number"]
    const sanitized = { ...data }

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]"
      }
    })

    return sanitized
  }

  private flush(): void {
    if (this.events.length === 0) return

    // In a real implementation, you would send the events to your analytics service
    // For now, we'll just log them to the console
    console.log(`[Analytics] Flushing ${this.events.length} events`)

    // Clear the events array
    this.events = []
  }

  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance()

// React hook for analytics
export function useAnalytics() {
  return analytics
}
