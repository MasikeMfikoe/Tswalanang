"use client"

import React from "react"

export function useClientOnlyEffect(effect: () => void, deps: React.DependencyList) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      effect()
    }
  }, deps)
}
