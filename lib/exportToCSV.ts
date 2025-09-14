import { format, parseISO } from "date-fns"

interface ExportableOrder {
  id: string
  po_number?: string
  created_at: string
  importer?: string
  customer_name?: string
  freight_type?: string
  eta?: string
  etd?: string
  value?: number
  trackingData?: {
    estimatedArrival?: string
    estimatedDeparture?: string
  }
}

export const exportToCSV = async (
  orders: ExportableOrder[],
  filename = "orders.csv",
  userRole?: string,
): Promise<void> => {
  if (orders.length === 0) {
    throw new Error("No orders to export")
  }

  // Define CSV headers
  const headers = ["Order Number", "Date", "Customer", "Freight Type", "ETA", "ETD"]

  // Add Total Value column if user is not an employee
  if (userRole !== "employee") {
    headers.push("Total Value")
  }

  // Convert orders to CSV rows
  const csvRows = orders.map((order) => {
    const row = [
      `"${order.po_number || ""}"`,
      `"${format(parseISO(order.created_at), "MMM dd, yyyy")}"`,
      `"${order.importer || order.customer_name || ""}"`,
      `"${order.freight_type || "N/A"}"`,
      `"${
        order.trackingData?.estimatedArrival
          ? format(parseISO(order.trackingData.estimatedArrival), "MMM dd, yyyy")
          : order.eta
            ? format(parseISO(order.eta), "MMM dd, yyyy")
            : "TBD"
      }"`,
      `"${
        order.trackingData?.estimatedDeparture
          ? format(parseISO(order.trackingData.estimatedDeparture), "MMM dd, yyyy")
          : order.etd
            ? format(parseISO(order.etd), "MMM dd, yyyy")
            : "TBD"
      }"`,
    ]

    // Add value if user is not an employee
    if (userRole !== "employee") {
      row.push(`"${order.value || 0}"`)
    }

    return row.join(",")
  })

  // Combine headers and rows
  const csvContent = [headers.join(","), ...csvRows].join("\n")

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}
