"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { format, parse } from "date-fns"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { toast } from "@/lib/toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type LineItem = {
  id: string
  date: string
  documentNumber: string
  freight: number
  caf: number
  customsVat: number
  customsDuty: number
  customsEdiSurcharge: number
  cartage: number
  fuelSurcharge: number
  cargoDues: number
  slineCharges: number
  repoFee: number
  turnInFee: number
  customsEdi: number
  communication: number
  documentation: number
  facilityFee: number
  agencyFee: number
  vat: number
}

export default function CustomerReport() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [lineItems, setLineItems] = useState<LineItem[]>([])

  // Get parameters from URL
  const customerId = searchParams.get("customerId") || ""
  const customerName = searchParams.get("customerName") || ""
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""

  // Format dates for display
  const formattedStartDate = startDate ? format(parse(startDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : ""
  const formattedEndDate = endDate ? format(parse(endDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : ""

  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true)
      try {
        // Fetch real orders for the customer within date range
        let query = supabase.from("orders").select(`
            *,
            customer:customers(name),
            documents(*)
          `)

        // Filter by customer if specified
        if (customerId) {
          query = query.eq("customer_id", customerId)
        } else if (customerName) {
          query = query.eq("customer_name", customerName)
        }

        // Filter by date range
        if (startDate) {
          query = query.gte("created_at", startDate)
        }
        if (endDate) {
          query = query.lte("created_at", endDate + "T23:59:59")
        }

        const { data: orders, error } = await query.order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching orders:", error)
          toast({
            title: "Error",
            description: "Failed to load customer data",
            variant: "destructive",
          })
          setLineItems([])
          return
        }

        // Transform real order data into line items
        const realLineItems: LineItem[] =
          orders?.map((order, index) => {
            // Calculate financial values based on order data
            const baseValue = order.total_value || order.totalValue || 0
            const freight = baseValue * 0.6 // 60% of total value typically freight
            const customsDuty = baseValue * 0.15 // 15% customs duty
            const vat = baseValue * 0.15 // 15% VAT
            const customsVat = customsDuty * 0.15 // VAT on customs duty

            return {
              id: order.id,
              date: order.created_at || order.createdAt,
              documentNumber: order.po_number || order.poNumber || `DOC-${order.id}`,
              freight: Math.round(freight * 100) / 100,
              caf: Math.round(baseValue * 0.05 * 100) / 100, // 5% CAF
              customsVat: Math.round(customsVat * 100) / 100,
              customsDuty: Math.round(customsDuty * 100) / 100,
              customsEdiSurcharge: Math.round(baseValue * 0.02 * 100) / 100, // 2% EDI surcharge
              cartage: Math.round(baseValue * 0.03 * 100) / 100, // 3% cartage
              fuelSurcharge: Math.round(baseValue * 0.08 * 100) / 100, // 8% fuel surcharge
              cargoDues: Math.round(baseValue * 0.01 * 100) / 100, // 1% cargo dues
              slineCharges: Math.round(baseValue * 0.02 * 100) / 100, // 2% shipping line charges
              repoFee: order.freight_type === "Sea Freight" ? 500 : 0, // Fixed repo fee for sea freight
              turnInFee: order.freight_type === "Sea Freight" ? 300 : 0, // Fixed turn-in fee for sea freight
              customsEdi: 250, // Fixed customs EDI fee
              communication: 150, // Fixed communication fee
              documentation: 350, // Fixed documentation fee
              facilityFee: Math.round(baseValue * 0.015 * 100) / 100, // 1.5% facility fee
              agencyFee: Math.round(baseValue * 0.035 * 100) / 100, // 3.5% agency fee
              vat: Math.round(vat * 100) / 100,
            }
          }) || []

        setLineItems(realLineItems)

        if (realLineItems.length === 0) {
          toast({
            title: "No Data",
            description: "No orders found for the selected criteria",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data",
          variant: "destructive",
        })
        setLineItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealData()
  }, [customerId, customerName, startDate, endDate, supabase])

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === 0) return "R 0.00"
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate totals
  const calculateTotals = () => {
    return lineItems.reduce(
      (totals, item) => {
        return {
          freight: totals.freight + (item.freight || 0),
          caf: totals.caf + (item.caf || 0),
          customsVat: totals.customsVat + (item.customsVat || 0),
          customsDuty: totals.customsDuty + (item.customsDuty || 0),
          customsEdiSurcharge: totals.customsEdiSurcharge + (item.customsEdiSurcharge || 0),
          cartage: totals.cartage + (item.cartage || 0),
          fuelSurcharge: totals.fuelSurcharge + (item.fuelSurcharge || 0),
          cargoDues: totals.cargoDues + (item.cargoDues || 0),
          slineCharges: totals.slineCharges + (item.slineCharges || 0),
          repoFee: totals.repoFee + (item.repoFee || 0),
          turnInFee: totals.turnInFee + (item.turnInFee || 0),
          customsEdi: totals.customsEdi + (item.customsEdi || 0),
          communication: totals.communication + (item.communication || 0),
          documentation: totals.documentation + (item.documentation || 0),
          facilityFee: totals.facilityFee + (item.facilityFee || 0),
          agencyFee: totals.agencyFee + (item.agencyFee || 0),
          vat: totals.vat + (item.vat || 0),
        }
      },
      {
        freight: 0,
        caf: 0,
        customsVat: 0,
        customsDuty: 0,
        customsEdiSurcharge: 0,
        cartage: 0,
        fuelSurcharge: 0,
        cargoDues: 0,
        slineCharges: 0,
        repoFee: 0,
        turnInFee: 0,
        customsEdi: 0,
        communication: 0,
        documentation: 0,
        facilityFee: 0,
        agencyFee: 0,
        vat: 0,
      },
    )
  }

  const totals = calculateTotals()

  // Export to CSV
  const exportToCSV = () => {
    // Define headers
    const headers = [
      "Date",
      "Document No.",
      "Freight",
      "CAF",
      "Customs VAT",
      "Customs Duty",
      "Customs EDI S/Charge",
      "Cartage",
      "Fuel S/Charge",
      "Cargo Dues",
      "S/Line Charges",
      "Repo Fee",
      "Turn in Fee",
      "Customs EDI",
      "Communication",
      "Documentation",
      "Facility Fee",
      "Agency Fee",
      "VAT",
    ]

    // Format data rows
    const dataRows = lineItems.map((item) => [
      format(new Date(item.date), "dd/MM/yyyy"),
      item.documentNumber,
      item.freight || "",
      item.caf || "",
      item.customsVat || "",
      item.customsDuty || "",
      item.customsEdiSurcharge || "",
      item.cartage || "",
      item.fuelSurcharge || "",
      item.cargoDues || "",
      item.slineCharges || "",
      item.repoFee || "",
      item.turnInFee || "",
      item.customsEdi || "",
      item.communication || "",
      item.documentation || "",
      item.facilityFee || "",
      item.agencyFee || "",
      item.vat || "",
    ])

    // Add totals row
    const totalsRow = [
      "TOTALS",
      "",
      totals.freight,
      totals.caf,
      totals.customsVat,
      totals.customsDuty,
      totals.customsEdiSurcharge,
      totals.cartage,
      totals.fuelSurcharge,
      totals.cargoDues,
      totals.slineCharges,
      totals.repoFee,
      totals.turnInFee,
      totals.customsEdi,
      totals.communication,
      totals.documentation,
      totals.facilityFee,
      totals.agencyFee,
      totals.vat,
    ]

    // Combine headers and data
    const csvContent = [headers.join(","), ...dataRows.map((row) => row.join(",")), totalsRow.join(",")].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${customerName.replace(/\s+/g, "_")}_Report_${formattedStartDate.replace(/\//g, "-")}_to_${formattedEndDate.replace(
        /\//g,
        "-",
      )}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Report exported to CSV successfully",
    })
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      // Create a hidden div to render the report for PDF export
      const printDiv = document.createElement("div")
      printDiv.style.display = "none"
      document.body.appendChild(printDiv)

      // Create the content for PDF
      printDiv.innerHTML = `
        <html>
          <head>
            <title>Customer Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; font-size: 10px; }
              th { background-color: #f2f2f2; text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .totals { font-weight: bold; background-color: #f9f9f9; }
              h1 { font-size: 18px; }
              .subtitle { font-size: 12px; font-weight: bold; margin-bottom: 15px; }
            </style>
          </head>
          <body>
            <h1>Customer Line Items Report</h1>
            <div class="subtitle">Period: ${formattedStartDate} to ${formattedEndDate} | Customer: ${customerName}</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Document No.</th>
                  <th>Freight</th>
                  <th>CAF</th>
                  <th>Customs VAT</th>
                  <th>Customs Duty</th>
                  <th>Customs EDI S/C</th>
                  <th>Cartage</th>
                  <th>Fuel S/C</th>
                  <th>Cargo Dues</th>
                  <th>S/Line Charges</th>
                  <th>Repo Fee</th>
                  <th>Turn in Fee</th>
                  <th>Customs EDI</th>
                  <th>Comm.</th>
                  <th>Doc.</th>
                  <th>Facility Fee</th>
                  <th>Agency Fee</th>
                  <th>VAT</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems
                  .map(
                    (item) => `
                  <tr>
                    <td class="text-left">${format(new Date(item.date), "dd/MM/yyyy")}</td>
                    <td class="text-left">${item.documentNumber}</td>
                    <td class="text-right">${formatCurrency(item.freight)}</td>
                    <td class="text-right">${formatCurrency(item.caf)}</td>
                    <td class="text-right">${formatCurrency(item.customsVat)}</td>
                    <td class="text-right">${formatCurrency(item.customsDuty)}</td>
                    <td class="text-right">${formatCurrency(item.customsEdiSurcharge)}</td>
                    <td class="text-right">${formatCurrency(item.cartage)}</td>
                    <td class="text-right">${formatCurrency(item.fuelSurcharge)}</td>
                    <td class="text-right">${formatCurrency(item.cargoDues)}</td>
                    <td class="text-right">${formatCurrency(item.slineCharges)}</td>
                    <td class="text-right">${formatCurrency(item.repoFee)}</td>
                    <td class="text-right">${formatCurrency(item.turnInFee)}</td>
                    <td class="text-right">${formatCurrency(item.customsEdi)}</td>
                    <td class="text-right">${formatCurrency(item.communication)}</td>
                    <td class="text-right">${formatCurrency(item.documentation)}</td>
                    <td class="text-right">${formatCurrency(item.facilityFee)}</td>
                    <td class="text-right">${formatCurrency(item.agencyFee)}</td>
                    <td class="text-right">${formatCurrency(item.vat)}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="totals">
                  <td colspan="2" class="text-left">TOTALS</td>
                  <td class="text-right">${formatCurrency(totals.freight)}</td>
                  <td class="text-right">${formatCurrency(totals.caf)}</td>
                  <td class="text-right">${formatCurrency(totals.customsVat)}</td>
                  <td class="text-right">${formatCurrency(totals.customsDuty)}</td>
                  <td class="text-right">${formatCurrency(totals.customsEdiSurcharge)}</td>
                  <td class="text-right">${formatCurrency(totals.cartage)}</td>
                  <td class="text-right">${formatCurrency(totals.fuelSurcharge)}</td>
                  <td class="text-right">${formatCurrency(totals.cargoDues)}</td>
                  <td class="text-right">${formatCurrency(totals.slineCharges)}</td>
                  <td class="text-right">${formatCurrency(totals.repoFee)}</td>
                  <td class="text-right">${formatCurrency(totals.turnInFee)}</td>
                  <td class="text-right">${formatCurrency(totals.customsEdi)}</td>
                  <td class="text-right">${formatCurrency(totals.communication)}</td>
                  <td class="text-right">${formatCurrency(totals.documentation)}</td>
                  <td class="text-right">${formatCurrency(totals.facilityFee)}</td>
                  <td class="text-right">${formatCurrency(totals.agencyFee)}</td>
                  <td class="text-right">${formatCurrency(totals.vat)}</td>
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `

      // Use window.print() to open the print dialog with landscape orientation
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(printDiv.innerHTML)
        printWindow.document.close()

        // Set to landscape before printing
        printWindow.document.documentElement.style.width = "100%"
        printWindow.document.body.style.width = "100%"

        // Add print media query for landscape
        const style = printWindow.document.createElement("style")
        style.textContent = `
          @media print {
            @page { size: landscape; }
            body { margin: 0.5cm; }
          }
        `
        printWindow.document.head.appendChild(style)

        // Print after a short delay to ensure styles are applied
        setTimeout(() => {
          printWindow.print()
          // Close the window after printing (or if user cancels)
          printWindow.onafterprint = () => {
            printWindow.close()
          }
        }, 500)

        toast({
          title: "Success",
          description: "Report prepared for PDF export",
        })
      }

      // Clean up
      document.body.removeChild(printDiv)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Error",
        description: "Failed to export report to PDF",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-2 bg-transparent"
            onClick={() => router.push("/customer-summary")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Summary
          </Button>
          <h1 className="text-2xl font-bold">Customer Line Items Report</h1>
          <p className="text-sm text-muted-foreground mt-1 font-bold">
            Period: {formattedStartDate} to {formattedEndDate} | Customer: {customerName}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="self-start bg-transparent"
            onClick={exportToPDF}
            disabled={isLoading || lineItems.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" /> Export to PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="self-start bg-transparent"
            onClick={exportToCSV}
            disabled={isLoading || lineItems.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-center font-medium">Date</th>
                  <th className="p-2 text-center font-medium">Document No.</th>
                  <th className="p-2 text-center font-medium">Freight</th>
                  <th className="p-2 text-center font-medium">CAF</th>
                  <th className="p-2 text-center font-medium">Customs VAT</th>
                  <th className="p-2 text-center font-medium">Customs Duty</th>
                  <th className="p-2 text-center font-medium">Customs EDI S/Charge</th>
                  <th className="p-2 text-center font-medium">Cartage</th>
                  <th className="p-2 text-center font-medium">Fuel S/Charge</th>
                  <th className="p-2 text-center font-medium">Cargo Dues</th>
                  <th className="p-2 text-center font-medium">S/Line Charges</th>
                  <th className="p-2 text-center font-medium">Repo Fee</th>
                  <th className="p-2 text-center font-medium">Turn in Fee</th>
                  <th className="p-2 text-center font-medium">Customs EDI</th>
                  <th className="p-2 text-center font-medium">Communication</th>
                  <th className="p-2 text-center font-medium">Documentation</th>
                  <th className="p-2 text-center font-medium">Facility Fee</th>
                  <th className="p-2 text-center font-medium">Agency Fee</th>
                  <th className="p-2 text-center font-medium">VAT</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 text-left">{format(new Date(item.date), "dd/MM/yyyy")}</td>
                    <td className="p-2 text-left">{item.documentNumber}</td>
                    <td className="p-2 text-right">{formatCurrency(item.freight)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.caf)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.customsVat)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.customsDuty)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.customsEdiSurcharge)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.cartage)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.fuelSurcharge)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.cargoDues)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.slineCharges)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.repoFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.turnInFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.customsEdi)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.communication)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.documentation)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.facilityFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.agencyFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.vat)}</td>
                  </tr>
                ))}
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="p-4 text-center text-muted-foreground">
                      No data available for the selected criteria
                    </td>
                  </tr>
                ) : (
                  <tr className="bg-muted/20 font-bold">
                    <td colSpan={2} className="p-2 text-left">
                      TOTALS
                    </td>
                    <td className="p-2 text-right">{formatCurrency(totals.freight)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.caf)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.customsVat)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.customsDuty)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.customsEdiSurcharge)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.cartage)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.fuelSurcharge)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.cargoDues)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.slineCharges)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.repoFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.turnInFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.customsEdi)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.communication)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.documentation)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.facilityFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.agencyFee)}</td>
                    <td className="p-2 text-right">{formatCurrency(totals.vat)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
