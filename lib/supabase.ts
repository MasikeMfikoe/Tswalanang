import { mockSupabaseClient } from "./supabaseClient"

// DEVELOPMENT MODE: Always use the mock client
// When you're ready to use real Supabase, uncomment the code below and add your credentials
export const supabase = mockSupabaseClient

// PRODUCTION MODE: Uncomment this when you're ready to use real Supabase
/*
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : mockSupabaseClient
*/

// Helper functions that work with both real and mock clients
export async function fetchData<T>(table: string, query?: any) {
  try {
    // For development, return mock data based on the table name
    if (table === "orders") {
      return getMockOrders() as unknown as T[]
    }
    if (table === "customers") {
      return getMockCustomers() as unknown as T[]
    }

    // Default behavior using the client (mock or real)
    let queryBuilder = supabase.from(table).select("*")

    if (query) {
      if (query.filter) {
        queryBuilder = queryBuilder.eq(query.filter.column, query.filter.value)
      }
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit)
      }
    }

    const { data, error } = await queryBuilder
    if (error) {
      console.log(`Note: Using mock data for ${table}`)
      return [] as T[]
    }

    return data as T[]
  } catch (e) {
    console.log(`Note: Using mock data for ${table}`)
    return [] as T[]
  }
}

export async function insertData<T>(table: string, data: Partial<T>) {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select()
    if (error) {
      console.log(`Note: Mock insert for ${table}`)
      return [data] as T[] // Return the input data as if it was inserted
    }
    return result as T[]
  } catch (e) {
    console.log(`Note: Mock insert for ${table}`)
    return [data] as T[] // Return the input data as if it was inserted
  }
}

export async function updateData<T>(table: string, id: string, data: Partial<T>) {
  try {
    const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select()
    if (error) {
      console.log(`Note: Mock update for ${table}`)
      return [{ ...data, id }] as T[] // Return the updated data
    }
    return result as T[]
  } catch (e) {
    console.log(`Note: Mock update for ${table}`)
    return [{ ...data, id }] as T[] // Return the updated data
  }
}

export async function deleteData(table: string, id: string) {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) {
      console.log(`Note: Mock delete for ${table}`)
    }
    return true
  } catch (e) {
    console.log(`Note: Mock delete for ${table}`)
    return true
  }
}

// Mock data functions
function getMockOrders() {
  return [
    {
      id: "PO-2024-001",
      customerName: "Acme Corporation",
      status: "Completed",
      totalValue: 12500,
      createdAt: "2024-01-15T10:30:00Z",
      poNumber: "PO001",
      supplier: "Supplier A",
      importer: "Acme Corp",
    },
    {
      id: "PO-2024-002",
      customerName: "TechNova Inc",
      status: "In Progress",
      totalValue: 8750,
      createdAt: "2024-01-20T14:45:00Z",
      poNumber: "PO002",
      supplier: "Supplier B",
      importer: "TechNova",
    },
    {
      id: "PO-2024-003",
      customerName: "Global Traders",
      status: "Pending",
      totalValue: 5200,
      createdAt: "2024-01-25T09:15:00Z",
      poNumber: "PO003",
      supplier: "Supplier C",
      importer: "Global Traders",
    },
    {
      id: "PO-2024-004",
      customerName: "Innovate Solutions",
      status: "Cancelled",
      totalValue: 3800,
      createdAt: "2024-01-28T16:20:00Z",
      poNumber: "PO004",
      supplier: "Supplier D",
      importer: "Innovate",
    },
    {
      id: "PO-2024-005",
      customerName: "Prime Logistics",
      status: "Completed",
      totalValue: 9300,
      createdAt: "2024-02-01T11:10:00Z",
      poNumber: "PO005",
      supplier: "Supplier E",
      importer: "Prime",
    },
    // Add more mock orders as needed
  ]
}

function getMockCustomers() {
  return [
    {
      id: "CUST-001",
      name: "Acme Corporation",
      contactPerson: "John Doe",
      email: "john@acme.com",
      phone: "+1-555-123-4567",
    },
    {
      id: "CUST-002",
      name: "TechNova Inc",
      contactPerson: "Jane Smith",
      email: "jane@technova.com",
      phone: "+1-555-987-6543",
    },
    {
      id: "CUST-003",
      name: "Global Traders",
      contactPerson: "Robert Johnson",
      email: "robert@globaltraders.com",
      phone: "+1-555-456-7890",
    },
    // Add more mock customers as needed
  ]
}
