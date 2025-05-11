import { render, screen, fireEvent, waitFor } from "@/lib/test-utils"
import { OrdersContent } from "@/components/OrdersContent"
import { ordersApi } from "@/lib/api/ordersApi"
import { mockPaginatedResponse, generateMockOrder } from "@/lib/test-utils"

// Mock the ordersApi
jest.mock("@/lib/api/ordersApi", () => ({
  ordersApi: {
    getOrders: jest.fn(),
  },
}))

describe("OrdersContent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading state initially", () => {
    // Mock the API response
    const mockOrders = Array(5)
      .fill(null)
      .map(() => generateMockOrder())
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValue(mockPaginatedResponse(mockOrders))

    render(<OrdersContent />)

    // Check if loading state is shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("renders orders after loading", async () => {
    // Mock the API response
    const mockOrders = Array(5)
      .fill(null)
      .map(() => generateMockOrder())
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValue(mockPaginatedResponse(mockOrders))

    render(<OrdersContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check if orders are rendered
    mockOrders.forEach((order) => {
      expect(screen.getByText(order.poNumber)).toBeInTheDocument()
    })
  })

  it("filters orders by search term", async () => {
    // Mock the API response
    const mockOrders = [generateMockOrder({ poNumber: "PO-12345" }), generateMockOrder({ poNumber: "PO-67890" })]
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValue(mockPaginatedResponse(mockOrders))

    render(<OrdersContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Enter search term
    const searchInput = screen.getByPlaceholderText(/search orders/i)
    fireEvent.change(searchInput, { target: { value: "12345" } })

    // Check if only matching order is shown
    expect(screen.getByText("PO-12345")).toBeInTheDocument()
    expect(screen.queryByText("PO-67890")).not.toBeInTheDocument()
  })

  it("filters orders by status", async () => {
    // Mock the API response
    const mockOrders = [
      generateMockOrder({ status: "Completed", poNumber: "PO-12345" }),
      generateMockOrder({ status: "In Progress", poNumber: "PO-67890" }),
    ]
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValue(mockPaginatedResponse(mockOrders))

    render(<OrdersContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Select status filter
    const statusFilter = screen.getByText(/filter by status/i)
    fireEvent.click(statusFilter)
    fireEvent.click(screen.getByText("Completed"))

    // Check if only matching order is shown
    expect(screen.getByText("PO-12345")).toBeInTheDocument()
    expect(screen.queryByText("PO-67890")).not.toBeInTheDocument()
  })

  it("shows empty state when no orders match filters", async () => {
    // Mock the API response
    const mockOrders = [generateMockOrder({ poNumber: "PO-12345" }), generateMockOrder({ poNumber: "PO-67890" })]
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValue(mockPaginatedResponse(mockOrders))

    render(<OrdersContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Enter search term that won't match any orders
    const searchInput = screen.getByPlaceholderText(/search orders/i)
    fireEvent.change(searchInput, { target: { value: "no-match" } })

    // Check if empty state is shown
    expect(screen.getByText(/no orders found/i)).toBeInTheDocument()
  })

  it("handles pagination correctly", async () => {
    // Mock the API response for first page
    const mockOrders1 = Array(5)
      .fill(null)
      .map(() => generateMockOrder())
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse(mockOrders1, 1, 5, 10))

    // Mock the API response for second page
    const mockOrders2 = Array(5)
      .fill(null)
      .map(() => generateMockOrder())
    ;(ordersApi.getOrders as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse(mockOrders2, 2, 5, 10))

    render(<OrdersContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check if first page orders are rendered
    mockOrders1.forEach((order) => {
      expect(screen.getByText(order.poNumber)).toBeInTheDocument()
    })

    // Click next page button
    fireEvent.click(screen.getByText("Next"))

    // Check if API was called with correct page
    expect(ordersApi.getOrders).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check if second page orders are rendered
    mockOrders2.forEach((order) => {
      expect(screen.getByText(order.poNumber)).toBeInTheDocument()
    })
  })
})
