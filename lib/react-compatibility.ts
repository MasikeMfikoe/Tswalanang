import { useId } from "react"

/**
 * A compatibility layer for React 18 features
 */

/**
 * Generate a stable ID that works with React 18
 * This is a replacement for the useId hook in React 19
 */
export function useStableId(prefix?: string): string {
  const id = useId()
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Other compatibility functions can be added here as needed
 */
