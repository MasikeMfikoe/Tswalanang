import { render, screen, waitFor } from "@testing-library/react"
import { OrdersContent } from "./OrdersContent"
import { getOrders } from "@/lib/api/ordersApi" // Mock this import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import jest from "jest" // Declare the jest variable

// Mock the API call
jest.mock("@/lib/api/ordersApi", () => ({
  getOrders: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "ORD001",
          customerName: "Test Customer 1",
          status: "Pending",
          totalValue: 100,
          currency: "USD",
          createdAt: "2024-01-01T00:00:00Z",
          lastUpdate: "2024-01-01T00:00:00Z",
        },
        {
          id: "ORD002",
          customerName: "Test Customer 2",
          status: "Delivered",
          totalValue: 200,
          currency: "USD",
          createdAt: "2024-01-02T00:00:00Z",
          lastUpdate: "2024-01-02T00:00:00Z",
        },
      ],
      total: 2,
      limit: 10,
      offset: 0,
    }),
  ),
}))

const queryClient = new QueryClient()

describe("OrdersContent", () => {
  it("renders orders correctly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersContent />
      </QueryClientProvider>,
    )

    // Check for loading state initially
    expect(screen.getByText(/Loading orders.../i)).toBeInTheDocument()

    // Wait for data to load and assert content
    await waitFor(() => {
      expect(screen.getByText("ORD001")).toBeInTheDocument()
      expect(screen.getByText("Test Customer 1")).toBeInTheDocument()
      expect(screen.getByText("Pending")).toBeInTheDocument()
      expect(screen.getByText("$100.00")).toBeInTheDocument()

      expect(screen.getByText("ORD002")).toBeInTheDocument()
      expect(screen.getByText("Test Customer 2")).toBeInTheDocument()
      expect(screen.getByText("Delivered")).toBeInTheDocument()
      expect(screen.getByText("$200.00")).toBeInTheDocument()
    })
  })

  it("displays error message on fetch failure", async () => {
    // Mock a failed API call
    ;(getOrders as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("API Error")))

    render(
      <QueryClientProvider client={queryClient}>
        <OrdersContent />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument()
    })
  })
})
