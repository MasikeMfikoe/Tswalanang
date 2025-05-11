"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { usePagination } from "./usePagination"
import { useSorting, type SortDirection } from "./useSorting"
import { useFiltering } from "./useFiltering"
import { useSearch } from "./useSearch"

interface DataTableOptions<TData, TFilter> {
  queryKey: unknown[]
  queryFn: (params: {
    page: number
    pageSize: number
    sortColumn?: string
    sortDirection?: SortDirection
    filters?: TFilter
    searchTerm?: string
  }) => Promise<{
    data: TData[]
    totalItems: number
  }>
  initialPageSize?: number
  initialSortColumn?: string
  initialSortDirection?: SortDirection
  initialFilters?: TFilter
  initialSearchTerm?: string
  searchFn?: (item: TData, term: string) => boolean
  filterFn?: (item: TData, filters: TFilter) => boolean
  getColumnValue?: (item: TData, column: string) => any
  clientSidePagination?: boolean
  clientSideSorting?: boolean
  clientSideFiltering?: boolean
  clientSideSearch?: boolean
}

export function useDataTable<TData, TFilter extends Record<string, any> = Record<string, any>>({
  queryKey,
  queryFn,
  initialPageSize = 10,
  initialSortColumn = "",
  initialSortDirection = null,
  initialFilters = {} as TFilter,
  initialSearchTerm = "",
  searchFn,
  filterFn,
  getColumnValue,
  clientSidePagination = false,
  clientSideSorting = false,
  clientSideFiltering = false,
  clientSideSearch = false,
}: DataTableOptions<TData, TFilter>) {
  // State for client-side data
  const [clientData, setClientData] = useState<TData[]>([])
  const [totalItems, setTotalItems] = useState(0)

  // Initialize hooks
  const pagination = usePagination({ initialPageSize })
  const sorting = useSorting({
    initialSortColumn,
    initialSortDirection,
  })
  const filtering = useFiltering({ initialFilters })
  const search = useSearch({ initialSearchTerm })

  // Prepare query parameters
  const queryParams = useMemo(() => {
    return {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      sortColumn: sorting.sortState.column,
      sortDirection: sorting.sortState.direction,
      filters: filtering.filters as TFilter,
      searchTerm: search.debouncedSearchTerm,
    }
  }, [pagination.currentPage, pagination.pageSize, sorting.sortState, filtering.filters, search.debouncedSearchTerm])

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => queryFn(queryParams),
    onSuccess: (data) => {
      setClientData(data.data)
      setTotalItems(data.totalItems)

      // Update pagination if total items changed
      if (pagination.totalItems !== data.totalItems) {
        pagination.setCurrentPage(1)
      }
    },
    enabled: !clientSidePagination || !clientSideSorting || !clientSideFiltering || !clientSideSearch,
  })

  // Process data client-side if needed
  const processedData = useMemo(() => {
    let result = clientData

    // Apply client-side filtering
    if (clientSideFiltering && filterFn) {
      result = filtering.filteredItems(result, filterFn)
    }

    // Apply client-side search
    if (clientSideSearch && searchFn) {
      result = search.searchedItems(result, searchFn)
    }

    // Apply client-side sorting
    if (clientSideSorting && getColumnValue) {
      result = sorting.sortedItems(result, getColumnValue)
    }

    // Apply client-side pagination
    if (clientSidePagination) {
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      return result.slice(startIndex, endIndex)
    }

    return result
  }, [
    clientData,
    clientSideFiltering,
    clientSideSearch,
    clientSideSorting,
    clientSidePagination,
    filtering,
    search,
    sorting,
    pagination,
    filterFn,
    searchFn,
    getColumnValue,
  ])

  // Reset pagination when filters or search changes
  const resetPagination = useCallback(() => {
    pagination.setCurrentPage(1)
  }, [pagination])

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      filtering.setFilter(key, value)
      resetPagination()
    },
    [filtering, resetPagination],
  )

  // Handle search changes
  const handleSearchChange = useCallback(
    (term: string) => {
      search.setSearchTerm(term)
      resetPagination()
    },
    [search, resetPagination],
  )

  return {
    data: data?.data || processedData,
    totalItems: data?.totalItems || totalItems,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    sorting,
    filtering: {
      ...filtering,
      setFilter: handleFilterChange,
    },
    search: {
      ...search,
      setSearchTerm: handleSearchChange,
    },
  }
}
