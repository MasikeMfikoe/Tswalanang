"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  fetchExchangeRates,
  convertCurrency,
  getFormattedDate,
  FAVORITE_PAIRS,
  getHistoricalData,
} from "@/lib/currency-api"
import { RefreshCw, Info, ArrowLeftRight, AlertCircle, Star, History, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"

interface ExchangeRates {
  [key: string]: number
}

interface RecentConversion {
  fromCurrency: string
  toCurrency: string
  amount: number
  result: number
  timestamp: Date
}

export default function CurrencyConversion() {
  const [amount, setAmount] = useState<string>("1")
  const [toAmount, setToAmount] = useState<string>("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("ZAR")
  const [result, setResult] = useState<number | null>(null)
  const [rates, setRates] = useState<ExchangeRates>({})
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [isEditingToAmount, setIsEditingToAmount] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const toInputRef = useRef<HTMLInputElement>(null)

  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  ]

  const loadExchangeRates = async () => {
    setIsLoading(true)
    setError(null)

    // Simulate rate limiting
    if (requestCount > 20) {
      setIsRateLimited(true)
      setError("Rate limit exceeded. Please try again later.")
      setIsLoading(false)
      return
    }

    try {
      const data = await fetchExchangeRates()
      if (data?.rates) {
        setRates(data.rates)
        setLastUpdated(getFormattedDate())
      } else {
        throw new Error("Invalid response format")
      }
      setIsLoading(false)
      setRequestCount((prev) => prev + 1)
    } catch (err) {
      setError("Failed to load exchange rates. Using fallback rates.")
      console.error(err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExchangeRates()

    // Refresh rates every 5 minutes
    const intervalId = setInterval(loadExchangeRates, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (Object.keys(rates).length > 0 && amount && fromCurrency && toCurrency && !isEditingToAmount) {
      try {
        const convertedAmount = convertCurrency(Number(amount), fromCurrency, toCurrency, rates)
        setResult(convertedAmount)
        setToAmount(convertedAmount.toFixed(2))
      } catch (err) {
        console.error("Conversion error:", err)
        setResult(null)
      }
    }
  }, [amount, fromCurrency, toCurrency, rates, isEditingToAmount])

  useEffect(() => {
    // Load historical data for the chart
    const data = getHistoricalData(fromCurrency, toCurrency)
    setChartData(data)
  }, [fromCurrency, toCurrency])

  const router = useRouter()

  // Calculate rates against USD for display
  const getExchangeRate = (currency: string) => {
    if (!rates?.USD || !rates?.[currency]) return "N/A"
    return rates[currency].toFixed(6)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)

    if (isEditingToAmount) {
      setAmount(toAmount)
      setIsEditingToAmount(false)
    }
  }

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingToAmount(true)
    setToAmount(e.target.value)

    if (Object.keys(rates).length > 0 && e.target.value && fromCurrency && toCurrency) {
      try {
        // Reverse conversion
        const convertedAmount = convertCurrency(Number(e.target.value), toCurrency, fromCurrency, rates)
        setAmount(convertedAmount.toFixed(2))
      } catch (err) {
        console.error("Reverse conversion error:", err)
      }
    }
  }

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingToAmount(false)
    setAmount(e.target.value)
  }

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value)
    setIsEditingToAmount(false)

    // Add to recent conversions if we have a result
    if (result !== null) {
      addToRecentConversions()
    }
  }

  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value)
    setIsEditingToAmount(false)

    // Add to recent conversions if we have a result
    if (result !== null) {
      addToRecentConversions()
    }
  }

  const addToRecentConversions = () => {
    if (result === null) return

    const newConversion: RecentConversion = {
      fromCurrency,
      toCurrency,
      amount: Number(amount),
      result,
      timestamp: new Date(),
    }

    setRecentConversions((prev) => {
      // Add to beginning, limit to 3 items
      const updated = [newConversion, ...prev]
      return updated.slice(0, 3)
    })
  }

  const selectFavoritePair = (from: string, to: string) => {
    setFromCurrency(from)
    setToCurrency(to)
    setIsEditingToAmount(false)
  }

  const formatNumber = (num: number, currency: string) => {
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getCurrencyFlag = (code: string) => {
    const currency = currencies.find((c) => c.code === code)
    return currency ? currency.flag : ""
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Currency Conversion</h1>
            <p className="text-sm text-muted-foreground">
              Real-time exchange rates
              {lastUpdated && <span> • Last updated: {lastUpdated}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadExchangeRates} disabled={isLoading || isRateLimited}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadExchangeRates} disabled={isRateLimited}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Currency Converter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Favorites Section */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" /> Favorites
              </h3>
              <div className="flex flex-wrap gap-2">
                {FAVORITE_PAIRS.map((pair) => (
                  <Badge
                    key={`${pair.from}_${pair.to}`}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => selectFavoritePair(pair.from, pair.to)}
                  >
                    {pair.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Conversions */}
            {recentConversions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <History className="h-4 w-4 mr-1 text-blue-500" /> Recent Conversions
                </h3>
                <div className="flex flex-col gap-2">
                  {recentConversions.map((conv, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 border rounded flex justify-between cursor-pointer hover:bg-accent"
                      onClick={() => selectFavoritePair(conv.fromCurrency, conv.toCurrency)}
                    >
                      <span>
                        {formatNumber(conv.amount, conv.fromCurrency)} → {formatNumber(conv.result, conv.toCurrency)}
                      </span>
                      <span className="text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(conv.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Converter Form */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="amount">From</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{currency.flag}</span>
                            {currency.code} - {currency.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={handleFromAmountChange}
                    placeholder="Enter amount"
                    className="w-full sm:w-1/2"
                  />
                </div>
              </div>

              <div className="flex justify-center md:col-span-1">
                <Button variant="outline" size="icon" onClick={swapCurrencies} className="rounded-full bg-transparent">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="toAmount">To</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center">
                            <span className="mr-2">{currency.flag}</span>
                            {currency.code} - {currency.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="toAmount"
                    type="number"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    placeholder="Result"
                    className="w-full sm:w-1/2"
                    ref={toInputRef}
                  />
                </div>
              </div>
            </div>

            {/* Conversion Result */}
            {result !== null && (
              <div className="mt-6 p-6 bg-muted rounded-lg border-l-4 border-primary">
                <p className="text-lg">{formatNumber(Number(amount), fromCurrency)} =</p>
                <p className="text-4xl font-bold my-2 text-primary">{formatNumber(result, toCurrency)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Exchange rate: 1 {fromCurrency} = {convertCurrency(1, fromCurrency, toCurrency, rates).toFixed(6)}{" "}
                  {toCurrency}
                </p>
              </div>
            )}

            {/* Historical Chart */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">7-Day Rate History</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(value) => value.toFixed(2)} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value.toFixed(4)} ${toCurrency}`, `1 ${fromCurrency} =`]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            <p>Exchange rates are updated every 5 minutes. Actual transaction rates may vary.</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Currency Rates (vs USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Rate (1 USD =)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.code}>
                    <TableCell className="flex items-center">
                      <span className="mr-2">{currency.flag}</span>
                      {currency.name}
                    </TableCell>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency.code === "USD" ? "1.0000" : getExchangeRate(currency.code)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Info className="h-4 w-4 mr-1" /> About these rates
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    These are interbank rates updated every 5 minutes. Actual transaction rates may vary.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
