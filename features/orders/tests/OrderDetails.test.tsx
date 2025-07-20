import { render, screen, waitFor } from "@testing-library/react"
import { OrderDetails } from "../components/OrderDetails"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Mock the API calls
jest.mock("../api/ordersApi", () => ({
  fetchOrderById: jest.fn((id) => {
    if (id === "ORD001") {
      return Promise.resolve({
        id: "ORD001",
        customerName: "Acme Corp",
        status: "In Transit",
        origin: "Shanghai",
        destination: "New York",
        eta: "2024-08-01",
        value: 15000,
        currency: "USD",
        description: "Electronics shipment",
        documents: [{ type: "Bill of Lading", url: "/docs/bill-of-lading-001.pdf" }],
      })
    }
    return Promise.reject(new Error("Order not found"))
  }),
  deleteOrder: jest.fn(() => Promise.resolve({ message: "Order deleted" })),
}))

// Mock useToast if it's used in the component
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

const queryClient = new QueryClient()

describe('OrderDetails', () => {
  it('renders loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrderDetails orderId="ORD001" />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Loading order details.../i)).toBeInTheDocument();
  });

  it('renders order details after loading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrderDetails orderId="ORD001" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading order details.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Order Details: ORD001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Shanghai')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('2024-08-01')).toBeInTheDocument();
    expect(screen.getByText('USD 15,000')).toBeInTheDocument();
    expect(screen.getByText('Electronics shipment')).toBeInTheDocument();
    expect(screen.getByText('Bill of Lading')).toBeInTheDocument();
  });

  it('renders "Order not found" if order does not exist', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrderDetails orderId="NONEXISTENT" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading order details.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Order not found.')).toBeInTheDocument();
  });

  it('renders error message if fetching fails', async () => {
    // Temporarily override mock to simulate fetch failure
    require('../api/ordersApi').fetchOrderById.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(
      <QueryClientProvider client={queryClient}>
        <OrderDetails orderId="ORD001" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading order details.../i)).not.toBeInTheDocument
