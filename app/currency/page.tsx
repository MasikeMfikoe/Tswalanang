import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"

export default function CurrencyPage() {
  const exchangeRates = [
    { currency: "USD", rate: 1.0, change: 0, status: "stable" },
    { currency: "EUR", rate: 0.92, change: -0.005, status: "down" },
    { currency: "GBP", rate: 0.79, change: 0.002, status: "up" },
    { currency: "JPY", rate: 156.23, change: 0.15, status: "up" },
    { currency: "CAD", rate: 1.37, change: -0.001, status: "down" },
    { currency: "AUD", rate: 1.51, change: 0.003, status: "up" },
    { currency: "ZAR", rate: 18.5, change: -0.05, status: "down" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Currency Exchange Rates</h1>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Exchange Rates</CardTitle>
            <CardDescription>Current exchange rates against USD.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Rate (vs USD)</TableHead>
                  <TableHead>Change (24h)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((rate) => (
                  <TableRow key={rate.currency}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      {rate.currency}
                    </TableCell>
                    <TableCell>{rate.rate.toFixed(4)}</TableCell>
                    <TableCell>
                      <span className={rate.change > 0 ? "text-green-500" : rate.change < 0 ? "text-red-500" : ""}>
                        {rate.change > 0 && <TrendingUp className="inline-block h-4 w-4 mr-1" />}
                        {rate.change < 0 && <TrendingDown className="inline-block h-4 w-4 mr-1" />}
                        {rate.change.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rate.status === "up" ? "success" : rate.status === "down" ? "destructive" : "secondary"
                        }
                      >
                        {rate.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
