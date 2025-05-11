"use client"

import { useState, useCallback, useMemo } from "react"

interface FilterState {
  [key: string]: any
}

interface FilteringOptions {
  initialFilters?: FilterState
}

export function useFiltering({ initialFilters = {} }: FilteringOptions = {}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasFilters = useMemo(() => Object.keys(filters).length > 0, [filters])

  const filteredItems = useCallback(
    <T,>(items: T[], filterFn: (item: T, filters: FilterState) => boolean): T[] => {
      if (!hasFilters) {
        return items
      }

      return items.filter((item) => filterFn(item, filters))
    },
    [filters, hasFilters],
  )

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasFilters,
    filteredItems,
  }
}
