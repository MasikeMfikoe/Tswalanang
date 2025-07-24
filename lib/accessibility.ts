"use client"

import { useEffect, useRef, useState } from "react"

// Focus trap hook
export function useFocusTrap(active = true) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const el = elRef.current
    if (!el) return

    // Find all focusable elements
    const focusableEls = el.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableEls.length === 0) return

    const firstFocusableEl = focusableEls[0] as HTMLElement
    const lastFocusableEl = focusableEls[focusableEls.length - 1] as HTMLElement

    // Save the previously focused element
    const previouslyFocused = document.activeElement as HTMLElement

    // Focus the first element
    firstFocusableEl.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      // If shift + tab and on first element, move to last element
      if (e.shiftKey && document.activeElement === firstFocusableEl) {
        e.preventDefault()
        lastFocusableEl.focus()
      }
      // If tab and on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
        e.preventDefault()
        firstFocusableEl.focus()
      }
    }

    el.addEventListener("keydown", handleKeyDown)

    return () => {
      el.removeEventListener("keydown", handleKeyDown)
      // Restore focus when unmounted
      if (previouslyFocused && "focus" in previouslyFocused) {
        previouslyFocused.focus()
      }
    }
  }, [active])

  return elRef
}

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Skip to content
    </a>
  )
}

// Announce messages to screen readers
export function useAnnounce() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!message) return

    // Create or get the live region
    let liveRegion = document.getElementById("sr-live-region")
    if (!liveRegion) {
      liveRegion = document.createElement("div")
      liveRegion.id = "sr-live-region"
      liveRegion.setAttribute("aria-live", "assertive")
      liveRegion.setAttribute("aria-atomic", "true")
      liveRegion.className = "sr-only"
      document.body.appendChild(liveRegion)
    }

    // Set the message
    liveRegion.textContent = message

    // Clear the message after a delay
    const timer = setTimeout(() => {
      liveRegion.textContent = ""
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [message])

  return setMessage
}

// Detect high contrast mode
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check if the user has high contrast mode enabled
    const mediaQuery = window.matchMedia("(forced-colors: active)")
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return isHighContrast
}

// Detect reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if the user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Keyboard navigation indicator
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.add("user-is-tabbing")
        window.removeEventListener("keydown", handleFirstTab)
      }
    }

    window.addEventListener("keydown", handleFirstTab)
    return () => {
      window.removeEventListener("keydown", handleFirstTab)
    }
  }, [])
}

// Announce messages to screen readers
export function announce(message: string) {
  console.log(`Accessibility announcement: ${message}`)
}
