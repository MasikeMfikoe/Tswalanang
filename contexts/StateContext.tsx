"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Order, Customer, Document, Delivery, CourierOrder, Notification } from "@/types/models"

// Define the state shape
interface AppState {
  orders: {
    items: Order[]
    loading: boolean
    error: string | null
    selectedOrder: Order | null
  }
  customers: {
    items: Customer[]
    loading: boolean
    error: string | null
    selectedCustomer: Customer | null
  }
  documents: {
    items: Document[]
    loading: boolean
    error: string | null
  }
  deliveries: {
    items: Delivery[]
    loading: boolean
    error: string | null
  }
  courierOrders: {
    items: CourierOrder[]
    loading: boolean
    error: string | null
  }
  ui: {
    theme: "light" | "dark"
    sidebarOpen: boolean
    notifications: Notification[]
    unreadNotificationsCount: number
  }
}

// Define action types
type ActionType =
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_ORDERS_LOADING"; payload: boolean }
  | { type: "SET_ORDERS_ERROR"; payload: string | null }
  | { type: "SET_SELECTED_ORDER"; payload: Order | null }
  | { type: "SET_CUSTOMERS"; payload: Customer[] }
  | { type: "SET_CUSTOMERS_LOADING"; payload: boolean }
  | { type: "SET_CUSTOMERS_ERROR"; payload: string | null }
  | { type: "SET_SELECTED_CUSTOMER"; payload: Customer | null }
  | { type: "SET_DOCUMENTS"; payload: Document[] }
  | { type: "SET_DOCUMENTS_LOADING"; payload: boolean }
  | { type: "SET_DOCUMENTS_ERROR"; payload: string | null }
  | { type: "SET_DELIVERIES"; payload: Delivery[] }
  | { type: "SET_DELIVERIES_LOADING"; payload: boolean }
  | { type: "SET_DELIVERIES_ERROR"; payload: string | null }
  | { type: "SET_COURIER_ORDERS"; payload: CourierOrder[] }
  | { type: "SET_COURIER_ORDERS_LOADING"; payload: boolean }
  | { type: "SET_COURIER_ORDERS_ERROR"; payload: string | null }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "MARK_NOTIFICATION_READ"; payload: number }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }

// Initial state
const initialState: AppState = {
  orders: {
    items: [],
    loading: false,
    error: null,
    selectedOrder: null,
  },
  customers: {
    items: [],
    loading: false,
    error: null,
    selectedCustomer: null,
  },
  documents: {
    items: [],
    loading: false,
    error: null,
  },
  deliveries: {
    items: [],
    loading: false,
    error: null,
  },
  courierOrders: {
    items: [],
    loading: false,
    error: null,
  },
  ui: {
    theme: "light",
    sidebarOpen: true,
    notifications: [],
    unreadNotificationsCount: 0,
  },
}

// Create the reducer function
function reducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case "SET_ORDERS":
      return {
        ...state,
        orders: {
          ...state.orders,
          items: action.payload,
        },
      }
    case "SET_ORDERS_LOADING":
      return {
        ...state,
        orders: {
          ...state.orders,
          loading: action.payload,
        },
      }
    case "SET_ORDERS_ERROR":
      return {
        ...state,
        orders: {
          ...state.orders,
          error: action.payload,
        },
      }
    case "SET_SELECTED_ORDER":
      return {
        ...state,
        orders: {
          ...state.orders,
          selectedOrder: action.payload,
        },
      }
    case "SET_CUSTOMERS":
      return {
        ...state,
        customers: {
          ...state.customers,
          items: action.payload,
        },
      }
    case "SET_CUSTOMERS_LOADING":
      return {
        ...state,
        customers: {
          ...state.customers,
          loading: action.payload,
        },
      }
    case "SET_CUSTOMERS_ERROR":
      return {
        ...state,
        customers: {
          ...state.customers,
          error: action.payload,
        },
      }
    case "SET_SELECTED_CUSTOMER":
      return {
        ...state,
        customers: {
          ...state.customers,
          selectedCustomer: action.payload,
        },
      }
    case "SET_DOCUMENTS":
      return {
        ...state,
        documents: {
          ...state.documents,
          items: action.payload,
        },
      }
    case "SET_DOCUMENTS_LOADING":
      return {
        ...state,
        documents: {
          ...state.documents,
          loading: action.payload,
        },
      }
    case "SET_DOCUMENTS_ERROR":
      return {
        ...state,
        documents: {
          ...state.documents,
          error: action.payload,
        },
      }
    case "SET_DELIVERIES":
      return {
        ...state,
        deliveries: {
          ...state.deliveries,
          items: action.payload,
        },
      }
    case "SET_DELIVERIES_LOADING":
      return {
        ...state,
        deliveries: {
          ...state.deliveries,
          loading: action.payload,
        },
      }
    case "SET_DELIVERIES_ERROR":
      return {
        ...state,
        deliveries: {
          ...state.deliveries,
          error: action.payload,
        },
      }
    case "SET_COURIER_ORDERS":
      return {
        ...state,
        courierOrders: {
          ...state.courierOrders,
          items: action.payload,
        },
      }
    case "SET_COURIER_ORDERS_LOADING":
      return {
        ...state,
        courierOrders: {
          ...state.courierOrders,
          loading: action.payload,
        },
      }
    case "SET_COURIER_ORDERS_ERROR":
      return {
        ...state,
        courierOrders: {
          ...state.courierOrders,
          error: action.payload,
        },
      }
    case "SET_THEME":
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      }
    case "SET_SIDEBAR_OPEN":
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: action.payload,
        },
      }
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: action.payload,
          unreadNotificationsCount: action.payload.filter((n) => !n.read).length,
        },
      }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
          unreadNotificationsCount: state.ui.unreadNotificationsCount - 1,
        },
      }
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationsCount: 0,
        },
      }
    default:
      return state
  }
}

// Create the context
interface StateContextType {
  state: AppState
  dispatch: React.Dispatch<ActionType>
}

const StateContext = createContext<StateContextType | undefined>(undefined)

// Create the provider component
export function StateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>
}

// Create a custom hook to use the context
export function useAppState() {
  const context = useContext(StateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within a StateProvider")
  }
  return context
}

// Create domain-specific hooks for better organization
export function useOrders() {
  const { state, dispatch } = useAppState()

  return {
    orders: state.orders.items,
    loading: state.orders.loading,
    error: state.orders.error,
    selectedOrder: state.orders.selectedOrder,
    setOrders: (orders: Order[]) => dispatch({ type: "SET_ORDERS", payload: orders }),
    setLoading: (loading: boolean) => dispatch({ type: "SET_ORDERS_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_ORDERS_ERROR", payload: error }),
    setSelectedOrder: (order: Order | null) => dispatch({ type: "SET_SELECTED_ORDER", payload: order }),
  }
}

export function useCustomers() {
  const { state, dispatch } = useAppState()

  return {
    customers: state.customers.items,
    loading: state.customers.loading,
    error: state.customers.error,
    selectedCustomer: state.customers.selectedCustomer,
    setCustomers: (customers: Customer[]) => dispatch({ type: "SET_CUSTOMERS", payload: customers }),
    setLoading: (loading: boolean) => dispatch({ type: "SET_CUSTOMERS_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_CUSTOMERS_ERROR", payload: error }),
    setSelectedCustomer: (customer: Customer | null) => dispatch({ type: "SET_SELECTED_CUSTOMER", payload: customer }),
  }
}

export function useDocuments() {
  const { state, dispatch } = useAppState()

  return {
    documents: state.documents.items,
    loading: state.documents.loading,
    error: state.documents.error,
    setDocuments: (documents: Document[]) => dispatch({ type: "SET_DOCUMENTS", payload: documents }),
    setLoading: (loading: boolean) => dispatch({ type: "SET_DOCUMENTS_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_DOCUMENTS_ERROR", payload: error }),
  }
}

export function useDeliveries() {
  const { state, dispatch } = useAppState()

  return {
    deliveries: state.deliveries.items,
    loading: state.deliveries.loading,
    error: state.deliveries.error,
    setDeliveries: (deliveries: Delivery[]) => dispatch({ type: "SET_DELIVERIES", payload: deliveries }),
    setLoading: (loading: boolean) => dispatch({ type: "SET_DELIVERIES_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_DELIVERIES_ERROR", payload: error }),
  }
}

export function useCourierOrders() {
  const { state, dispatch } = useAppState()

  return {
    courierOrders: state.courierOrders.items,
    loading: state.courierOrders.loading,
    error: state.courierOrders.error,
    setCourierOrders: (orders: CourierOrder[]) => dispatch({ type: "SET_COURIER_ORDERS", payload: orders }),
    setLoading: (loading: boolean) => dispatch({ type: "SET_COURIER_ORDERS_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_COURIER_ORDERS_ERROR", payload: error }),
  }
}

export function useUI() {
  const { state, dispatch } = useAppState()

  return {
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    notifications: state.ui.notifications,
    unreadNotificationsCount: state.ui.unreadNotificationsCount,
    setTheme: (theme: "light" | "dark") => dispatch({ type: "SET_THEME", payload: theme }),
    setSidebarOpen: (open: boolean) => dispatch({ type: "SET_SIDEBAR_OPEN", payload: open }),
    setNotifications: (notifications: Notification[]) =>
      dispatch({ type: "SET_NOTIFICATIONS", payload: notifications }),
    markNotificationRead: (id: number) => dispatch({ type: "MARK_NOTIFICATION_READ", payload: id }),
    markAllNotificationsRead: () => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
  }
}
