"use client"

import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { getExchangeRates, convertCurrency } from "@/lib/currency-api" // Assuming these functions exist

interface ExchangeRate {
  currency: string
  rate: number
}

export default function CurrencyPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState(1)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedRates = await getExchangeRates("USD") // Fetch base USD rates
        const formattedRates = Object.entries(fetchedRates).map(([currency, rate]) => ({
          currency,
          rate: Number.parseFloat(rate.toFixed(4)),
        }))
        setRates(formattedRates)
      } catch (err) {
        setError("Failed to fetch exchange rates.")
        console.error("Error fetching rates:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  const handleConvert = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await convertCurrency(amount, fromCurrency, toCurrency)
      setConvertedAmount(Number.parseFloat(result.toFixed(2)))
    } catch (err) {
      setError("Failed to convert currency. Please check inputs.")
      console.error("Error converting currency:", err)
      setConvertedAmount(null)
    } finally {
      setLoading(false)
    }
  }

  const availableCurrencies = rates.map((r) => r.currency).sort()

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Currency Exchange" description="View live exchange rates and convert between currencies." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Converter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromCurrency">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="fromCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toCurrency">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="toCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleConvert} disabled={loading}>
              {loading ? "Converting..." : "Convert"}
            </Button>
            {convertedAmount !== null && (
              <div className="text-center text-lg font-semibold">
                {amount} {fromCurrency} = {convertedAmount} {toCurrency}
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </CardContent>
        </Card>

        {/* Live Exchange Rates Card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Exchange Rates (Base: USD)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && rates.length === 0 ? (
              <p className="text-gray-500">Loading rates...</p>
            ) : error && rates.length === 0 ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Rate (vs USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.currency}>
                        <TableCell>{rate.currency}</TableCell>
                        <TableCell className="text-right">{rate.rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
