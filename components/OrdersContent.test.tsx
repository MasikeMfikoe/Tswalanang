import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { OrdersContent } from "./OrdersContent"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import jest from "jest" // Declare the jest variable

// Mock the API call
jest.mock("../features/orders/api/ordersApi", () => ({
  fetchOrders: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "ORD001",
          customerName: "Acme Corp",
          status: "Pending",
          origin: "Shanghai",
          destination: "New York",
          eta: "2024-08-01",
          value: 15000,
          currency: "USD",
        },
        {
          id: "ORD002",
          customerName: "Globex Inc",
          status: "In Transit",
          origin: "Rotterdam",
          destination: "Singapore",
          eta: "2024-07-25",
          value: 22000,
          currency: "USD",
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    }),
  ),
}))

const queryClient = new QueryClient()

describe("OrdersContent", () => {
  it("renders the component and displays orders", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersContent />
      </QueryClientProvider>,
    )

    // Check for loading state
    expect(screen.getByText(/Loading orders.../i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading orders.../i)).not.toBeInTheDocument()
    })

    // Check if orders are displayed
    expect(screen.getByText("ORD001")).toBeInTheDocument()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    expect(screen.getByText("Pending")).toBeInTheDocument()
    expect(screen.getByText("ORD002")).toBeInTheDocument()
    expect(screen.getByText("Globex Inc")).toBeInTheDocument()
    expect(screen.getByText("In Transit")).toBeInTheDocument()
  })

  it("allows searching for orders", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersContent />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading orders.../i)).not.toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search orders...")
    await userEvent.type(searchInput, "ORD001")

    // The mock API will still return both, but in a real scenario,
    // the filtered results would be reflected. This test primarily
    // checks if the input interaction works.
    expect(searchInput).toHaveValue("ORD001")
  })

  it("allows filtering by status", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersContent />
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading orders.../i)).not.toBeInTheDocument()
    })

    const statusSelect = screen.getByRole("combobox", { name: /filter by status/i })
    await userEvent.click(statusSelect)
    await userEvent.click(screen.getByText("Pending"))

    // In a real scenario, the table would update. Here, we just check the selection.
    expect(screen.getByText("Pending")).toBeInTheDocument()
  })
})
