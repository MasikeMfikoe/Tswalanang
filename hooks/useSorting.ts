"use client"

import { useState, useCallback } from "react"

export type SortDirection = "asc" | "desc" | null

export interface SortState {
  column: string
  direction: SortDirection
}

interface SortingOptions {
  initialSortColumn?: string
  initialSortDirection?: SortDirection
  defaultSortColumn?: string
  defaultSortDirection?: SortDirection
}

export function useSorting({
  initialSortColumn = "",
  initialSortDirection = null,
  defaultSortColumn = "",
  defaultSortDirection = "asc",
}: SortingOptions = {}) {
  const [sortState, setSortState] = useState<SortState>({
    column: initialSortColumn || defaultSortColumn,
    direction: initialSortDirection || (initialSortColumn ? defaultSortDirection : null),
  })

  const sort = useCallback(
    (column: string) => {
      setSortState((prevState) => {
        // If clicking on a different column, sort by that column in the default direction
        if (prevState.column !== column) {
          return {
            column,
            direction: defaultSortDirection,
          }
        }

        // If clicking on the same column, cycle through sort directions
        const nextDirection = prevState.direction === "asc" ? "desc" : prevState.direction === "desc" ? null : "asc"

        // If direction becomes null and we have a default column, switch to that
        if (nextDirection === null && defaultSortColumn && defaultSortColumn !== column) {
          return {
            column: defaultSortColumn,
            direction: defaultSortDirection,
          }
        }

        return {
          column: nextDirection === null ? "" : column,
          direction: nextDirection,
        }
      })
    },
    [defaultSortColumn, defaultSortDirection],
  )

  const resetSort = useCallback(() => {
    setSortState({
      column: defaultSortColumn,
      direction: defaultSortColumn ? defaultSortDirection : null,
    })
  }, [defaultSortColumn, defaultSortDirection])

  const sortedItems = useCallback(
    <T,>(items: T[], getColumnValue: (item: T, column: string) => any): T[] => {
      if (!sortState.column || !sortState.direction) {
        return items
      }

      return [...items].sort((a, b) => {
        const aValue = getColumnValue(a, sortState.column)
        const bValue = getColumnValue(b, sortState.column)

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortState.direction === "asc" ? -1 : 1
        if (bValue == null) return sortState.direction === "asc" ? 1 : -1

        // Compare based on value type
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortState.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        // For numbers, dates, etc.
        return sortState.direction === "asc"
          ? aValue < bValue
            ? -1
            : aValue > bValue
              ? 1
              : 0
          : aValue < bValue
            ? 1
            : aValue > bValue
              ? -1
              : 0
      })
    },
    [sortState],
  )

  return {
    sortState,
    sort,
    resetSort,
    sortedItems,
  }
}
