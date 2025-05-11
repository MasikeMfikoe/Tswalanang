"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ExchangeRates {
  [key: string]: number
}

export default function CurrencyConversion() {
  const [amount, setAmount] = useState<string>("1")
  const [fromCurrency, setFromCurrency] = useState("ZAR")
  const [toCurrency, setToCurrency] = useState("USD")
  const [result, setResult] = useState<number | null>(null)
  const [rates, setRates] = useState<ExchangeRates>({})

  const currencies = [
    { code: "ZAR", name: "South African Rand" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
  ]

  useEffect(() => {
    // In a real application, you would fetch current exchange rates from an API
    // For demo purposes, using static rates
    setRates({
      ZAR: 1,
      USD: 0.053,
      EUR: 0.049,
      GBP: 0.042,
      AUD: 0.081,
      CAD: 0.071,
    })
  }, [])

  useEffect(() => {
    if (rates[fromCurrency] && rates[toCurrency] && amount) {
      const fromRate = rates[fromCurrency]
      const toRate = rates[toCurrency]
      const converted = (Number(amount) / fromRate) * toRate
      setResult(converted)
    }
  }, [amount, fromCurrency, toCurrency, rates])

  const router = useRouter()

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Currency Conversion</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Convert Currency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Currency</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Currency</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {result !== null && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-lg">
                    {Number(amount).toLocaleString("en-ZA", { style: "currency", currency: fromCurrency })} =
                  </p>
                  <p className="text-2xl font-bold">
                    {result.toLocaleString("en-ZA", { style: "currency", currency: toCurrency })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Exchange rate: 1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)}{" "}
                    {toCurrency}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
