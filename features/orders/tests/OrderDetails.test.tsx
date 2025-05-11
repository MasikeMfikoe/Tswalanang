import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import OrderDetails from "@/features/orders/components/OrderDetails"
import { fetchOrder, updateOrder } from "@/features/orders/api/ordersApi"

// Mock the API functions
jest.mock("@/features/orders/api/ordersApi", () => ({
  fetchOrder: jest.fn(),
  updateOrder: jest.fn(),
}))

// Mock the toast component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("OrderDetails", () => {
  const mockOrder = {
    id: "123",
    poNumber: "PO001",
    supplier: "Supplier A",
    importer: "Importer X",
    status: "In Progress",
    cargoStatus: "In Transit",
    freightType: "Sea Freight",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful API response
    ;(fetchOrder as jest.Mock).mockResolvedValue(mockOrder)
    ;(updateOrder as jest.Mock).mockResolvedValue({ ...mockOrder, status: "Updated" })
  })

  test("renders order details correctly", async () => {
    render(<OrderDetails orderId="123" />)

    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("PO001")).toBeInTheDocument()
    })

    // Check order details are displayed
    expect(screen.getByText("Supplier A")).toBeInTheDocument()
    expect(screen.getByText("Importer X")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
  })

  test("allows editing order details", async () => {
    render(<OrderDetails orderId="123" />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("PO001")).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByText("Edit Order"))

    // Change status
    const statusSelect = screen.getByLabelText("Order Status:")
    fireEvent.change(statusSelect, { target: { value: "Completed" } })

    // Save changes
    fireEvent.click(screen.getByText("Save Changes"))

    // Verify API was called with updated data
    expect(updateOrder).toHaveBeenCalledWith({
      ...mockOrder,
      status: "Completed",
    })
  })

  test("handles API errors gracefully", async () => {
    // Mock API error
    ;(fetchOrder as jest.Mock).mockRejectedValue(new Error("Failed to fetch"))

    render(<OrderDetails orderId="123" />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
