"use client"

import { useState, useCallback } from "react"
import React from "react"

interface SearchOptions {
  initialSearchTerm?: string
  debounceTime?: number
}

export function useSearch({ initialSearchTerm = "", debounceTime = 300 }: SearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm)
  const [isSearching, setIsSearching] = useState(false)
  const [filteredData, setFilteredData] = useState([])

  // Debounce search term
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term)
      setIsSearching(true)

      const handler = setTimeout(() => {
        setDebouncedSearchTerm(term)
        setIsSearching(false)
      }, debounceTime)

      return () => {
        clearTimeout(handler)
      }
    },
    [debounceTime],
  )

  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setIsSearching(false)
    setFilteredData([])
  }, [])

  const searchedItems = useCallback(
    <T,>(items: T[], searchFn: (item: T, term: string) => boolean): T[] => {
      if (!debouncedSearchTerm) {
        setFilteredData(items)
        return items
      }

      const filtered = items.filter((item) => searchFn(item, debouncedSearchTerm))
      setFilteredData(filtered)
      return filtered
    },
    [debouncedSearchTerm],
  )

  const highlightSearchTerm = useCallback(
    (text: string): React.ReactNode => {
      if (!debouncedSearchTerm || !text) {
        return text
      }

      const parts = text.split(new RegExp(`(${debouncedSearchTerm})`, "gi"))

      return React.createElement(
        React.Fragment,
        null,
        parts.map((part, index) =>
          part.toLowerCase() === debouncedSearchTerm.toLowerCase()
            ? React.createElement(
                "mark",
                {
                  key: index,
                  className: "bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded",
                },
                part,
              )
            : React.createElement(React.Fragment, { key: index }, part),
        ),
      )
    },
    [debouncedSearchTerm],
  )

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setSearchTerm: handleSearchChange,
    clearSearch,
    searchedItems,
    highlightSearchTerm,
    filteredData,
  }
}
