"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext
} from "@/components/ui/pagination"
import { LoadingState, TableSkeleton } from "@/components/ui/loading-state"
import { ChevronDown, ChevronUp, Search, X, Filter, Download, Printer, RefreshCw, Settings } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import type { SortDirection } from "@/hooks/useSorting"

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  className?: string
  headerClassName?: string
  hidden?: boolean
}

interface DataTableAdvancedProps<T> {
  columns: Column<T>[]
  data: T[]
  totalItems: number
  isLoading: boolean
  isError?: boolean
  error?: any

  // Pagination
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]

  // Sorting
  sortColumn?: string
  sortDirection?: SortDirection
  onSort?: (column: string) => void

  // Filtering
  filters?: Record<string, any>
  onFilterChange?: (key: string, value: any) => void
  onClearFilters?: () => void

  // Search
  searchTerm?: string
  onSearch?: (term: string) => void
  onClearSearch?: () => void

  // Refresh
  onRefresh?: () => void

  // Export
  onExport?: () => void

  // Print
  onPrint?: () => void

  // Column visibility
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void

  // Row actions
  rowActions?: (row: T) => React.ReactNode

  // Styling
  className?: string
  tableClassName?: string

  // Empty state
  emptyState?: React.ReactNode

  // Error state
  errorState?: React.ReactNode

  // Title and description
  title?: string
  description?: string
}

export function DataTableAdvanced<T>({
  columns,
  data,
  totalItems,
  isLoading,
  isError = false,
  error,

  // Pagination
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],

  // Sorting
  sortColumn,
  sortDirection,
  onSort,

  // Filtering
  filters,
  onFilterChange,
  onClearFilters,

  // Search
  searchTerm = "",
  onSearch,
  onClearSearch,

  // Refresh
  onRefresh,

  // Export
  onExport,

  // Print
  onPrint,

  // Column visibility
  onColumnVisibilityChange,

  // Row actions
  rowActions,

  // Styling
  className,
  tableClassName,

  // Empty state
  emptyState,

  // Error state
  errorState,

  // Title and description
  title,
  description,
}: DataTableAdvancedProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce(
      (acc, column) => ({
        ...acc,
        [column.id]: !column.hidden,
      }),
      {},
    ),
  )

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: visible,
    }))

    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(columnId, visible)
    }
  }

  // Filter visible columns
  const visibleColumnsArray = columns.filter((column) => visibleColumns[column.id] !== false)

  // Handle sort
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return
    onSort(column.id)
  }

  // Render sort indicator
  const renderSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null

    if (sortColumn === column.id) {
      return sortDirection === "asc" ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : sortDirection === "desc" ? (
        <ChevronDown className="ml-1 h-4 w-4" />
      ) : null
    }

    return null
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  // Render error state
  if (isError) {
    return (
      errorState || (
        <div className="rounded-md border border-destructive/50 p-6 text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error loading data</h3>
          <p className="text-muted-foreground mb-4">{error?.message || "An unexpected error occurred"}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      )
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description || onSearch || onRefresh || onExport || onPrint) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Title and description */}
          {(title || description) && (
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 h-9 w-[150px] sm:w-[200px] md:w-[300px]"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && onClearSearch && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Filters */}
            {onFilterChange && filters && Object.keys(filters).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                      {Object.keys(filters).length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Active Filters</p>
                    <div className="space-y-1">
                      {Object.entries(filters).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-2">
                          <span className="text-sm">
                            {key}: {value.toString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onFilterChange(key, undefined)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {onClearFilters && (
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={onClearFilters}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Refresh */}
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                )}

                {/* Export */}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                )}

                {/* Print */}
                {onPrint && (
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                )}

                {/* Column visibility */}
                {onColumnVisibilityChange && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <p className="text-sm font-medium mb-1">Toggle Columns</p>
                      {columns.map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={visibleColumns[column.id] !== false}
                          onCheckedChange={(checked) => handleColumnVisibilityChange(column.id, checked)}
                          className="capitalize"
                        >
                          {column.header}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Table */}
      <LoadingState loading={isLoading} skeleton={<TableSkeleton columns={visibleColumnsArray.length} rows={5} />}>
        <div className="rounded-md border">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {visibleColumnsArray.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(column.sortable && "cursor-pointer select-none", column.headerClassName)}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {renderSortIndicator(column)}
                    </div>
                  </TableHead>
                ))}
                {rowActions && <TableHead className="w-[100px] text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsArray.length + (rowActions ? 1 : 0)} className="h-24 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No results found</p>
                        {(searchTerm || (filters && Object.keys(filters).length > 0)) && (
                          <p className="text-sm">Try adjusting your search or filters</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {visibleColumnsArray.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        {column.cell
                          ? column.cell(row)
                          : column.accessorFn
                            ? column.accessorFn(row)
                            : column.accessorKey
                              ? row[column.accessorKey as keyof T]
                              : null}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell>
                        <div className="flex items-center justify-end">{rowActions(row)}</div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LoadingState>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showPageSizeSelector={!!onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
          className="mt-4"
        />
      )}
    </div>
  )
}
