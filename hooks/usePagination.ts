"use client"

import { useState, useCallback, useMemo } from "react"

interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
}

export function usePagination({ initialPage = 1, initialPageSize = 10, totalItems = 0 }: PaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Calculate total pages
  const totalPages = useMemo(() => {
    return totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0
  }, [totalItems, pageSize])

  // Ensure current page is within bounds
  const safePage = useMemo(() => {
    return Math.max(1, Math.min(currentPage, totalPages || 1))
  }, [currentPage, totalPages])

  // If current page is out of bounds, update it
  if (safePage !== currentPage) {
    setCurrentPage(safePage)
  }

  // Calculate pagination metadata
  const metadata = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)

    return {
      currentPage: safePage,
      pageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    }
  }, [safePage, pageSize, totalPages, totalItems])

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)))
    },
    [totalPages],
  )

  const goToNextPage = useCallback(() => {
    if (safePage < totalPages) {
      setCurrentPage(safePage + 1)
    }
  }, [safePage, totalPages])

  const goToPreviousPage = useCallback(() => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1)
    }
  }, [safePage])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages || 1)
  }, [totalPages])

  const changePageSize = useCallback(
    (newPageSize: number) => {
      // When changing page size, try to keep the same items visible
      const firstItemIndex = (safePage - 1) * pageSize
      const newPage = Math.floor(firstItemIndex / newPageSize) + 1

      setPageSize(newPageSize)
      setCurrentPage(newPage)
    },
    [safePage, pageSize],
  )

  return {
    ...metadata,
    setCurrentPage: goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
  }
}
