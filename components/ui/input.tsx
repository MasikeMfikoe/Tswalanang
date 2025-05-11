"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  periodSelector?: boolean
  onPeriodChange?: (period: string, startDate: string, endDate: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, periodSelector, onPeriodChange, ...props }, ref) => {
    const [showPeriodDropdown, setShowPeriodDropdown] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const mergedRef = (node: HTMLInputElement) => {
      // Forward the ref to both our local ref and the one passed from parent
      inputRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowPeriodDropdown(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    const handlePeriodSelect = (period: string) => {
      let startDate = ""
      let endDate = ""
      const today = new Date()

      switch (period) {
        case "today":
          startDate = endDate = today.toISOString().split("T")[0]
          break
        case "yesterday":
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          startDate = endDate = yesterday.toISOString().split("T")[0]
          break
        case "last7days":
          const sevenDaysAgo = new Date(today)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
          startDate = sevenDaysAgo.toISOString().split("T")[0]
          endDate = today.toISOString().split("T")[0]
          break
        case "last30days":
          const thirtyDaysAgo = new Date(today)
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
          startDate = thirtyDaysAgo.toISOString().split("T")[0]
          endDate = today.toISOString().split("T")[0]
          break
        case "thisMonth":
          const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          startDate = firstDayThisMonth.toISOString().split("T")[0]
          endDate = today.toISOString().split("T")[0]
          break
        case "lastMonth":
          const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
          startDate = firstDayLastMonth.toISOString().split("T")[0]
          endDate = lastDayLastMonth.toISOString().split("T")[0]
          break
        case "custom":
          // For custom, we'll let the parent component handle it
          break
      }

      if (onPeriodChange) {
        onPeriodChange(period, startDate, endDate)
      }

      // Update the input value if it's not a custom period
      if (period !== "custom" && inputRef.current) {
        inputRef.current.value = startDate
        // Trigger change event
        const event = new Event("change", { bubbles: true })
        inputRef.current.dispatchEvent(event)
      }

      setShowPeriodDropdown(false)
    }

    return (
      <div className="relative">
        <input
          type={type}
          pattern={type === "text" && props["aria-label"]?.toLowerCase().includes("po") ? "[A-Za-z0-9-]*" : undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            periodSelector && "pr-10",
            className,
          )}
          ref={mergedRef}
          onClick={() => {
            if (type === "date" && periodSelector) {
              setShowPeriodDropdown(true)
            }
          }}
          {...props}
        />

        {type === "date" && periodSelector && (
          <>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.preventDefault()
                setShowPeriodDropdown(!showPeriodDropdown)
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"></path>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </button>

            {showPeriodDropdown && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("today")}
                  >
                    Today
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("yesterday")}
                  >
                    Yesterday
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("last7days")}
                  >
                    Last 7 days
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("last30days")}
                  >
                    Last 30 days
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("thisMonth")}
                  >
                    This month
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("lastMonth")}
                  >
                    Last month
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => handlePeriodSelect("custom")}
                  >
                    Custom range
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
