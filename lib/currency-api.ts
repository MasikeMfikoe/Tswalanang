// Cache for storing exchange rates
let ratesCache: {
  timestamp: number
  rates: Record<string, number>
} | null = null

// Common currency conversion rates
export const COMMON_CONVERSIONS = {
  USD_ZAR: {
    rate: 18.87,
    fromCurrency: "USD",
    toCurrency: "ZAR",
  },
  EUR_USD: {
    rate: 1.12426,
    fromCurrency: "EUR",
    toCurrency: "USD",
  },
  GBP_USD: {
    rate: 1.27,
    fromCurrency: "GBP",
    toCurrency: "USD",
  },
  USD_JPY: {
    rate: 149.5,
    fromCurrency: "USD",
    toCurrency: "JPY",
  },
  ZAR_USD: {
    rate: 0.053,
    fromCurrency: "ZAR",
    toCurrency: "USD",
  },
}

// Favorite currency pairs
export const FAVORITE_PAIRS = [
  { from: "USD", to: "EUR", label: "USD → EUR" },
  { from: "USD", to: "GBP", label: "USD → GBP" },
  { from: "EUR", to: "USD", label: "EUR → USD" },
  { from: "USD", to: "ZAR", label: "USD → ZAR" },
  { from: "GBP", to: "USD", label: "GBP → USD" },
]

// Mock historical data for the chart
export const HISTORICAL_DATA = {
  USD_ZAR: [
    { date: "2023-05-08", rate: 18.65 },
    { date: "2023-05-09", rate: 18.72 },
    { date: "2023-05-10", rate: 18.79 },
    { date: "2023-05-11", rate: 18.83 },
    { date: "2023-05-12", rate: 18.87 },
    { date: "2023-05-13", rate: 18.91 },
    { date: "2023-05-14", rate: 18.87 },
  ],
  USD_EUR: [
    { date: "2023-05-08", rate: 0.89 },
    { date: "2023-05-09", rate: 0.9 },
    { date: "2023-05-10", rate: 0.91 },
    { date: "2023-05-11", rate: 0.92 },
    { date: "2023-05-12", rate: 0.92 },
    { date: "2023-05-13", rate: 0.91 },
    { date: "2023-05-14", rate: 0.92 },
  ],
  USD_GBP: [
    { date: "2023-05-08", rate: 0.76 },
    { date: "2023-05-09", rate: 0.77 },
    { date: "2023-05-10", rate: 0.78 },
    { date: "2023-05-11", rate: 0.79 },
    { date: "2023-05-12", rate: 0.79 },
    { date: "2023-05-13", rate: 0.78 },
    { date: "2023-05-14", rate: 0.79 },
  ],
}

// Get historical data for a currency pair
export function getHistoricalData(fromCurrency: string, toCurrency: string) {
  const key = `${fromCurrency}_${toCurrency}`
  if (HISTORICAL_DATA[key]) {
    return HISTORICAL_DATA[key]
  }

  // If the reverse pair exists, calculate the inverse rates
  const reverseKey = `${toCurrency}_${fromCurrency}`
  if (HISTORICAL_DATA[reverseKey]) {
    return HISTORICAL_DATA[reverseKey].map((item) => ({
      date: item.date,
      rate: 1 / item.rate,
    }))
  }

  // Fallback to USD_ZAR data with adjusted rates
  return HISTORICAL_DATA.USD_ZAR.map((item) => ({
    date: item.date,
    rate: item.rate * 0.05, // Just a mock adjustment
  }))
}

// Format date for display
export function getFormattedDate() {
  return new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Fetch exchange rates with caching
export async function fetchExchangeRates() {
  // Check if we have a valid cache (less than 5 minutes old)
  const now = Date.now()
  if (ratesCache && now - ratesCache.timestamp < 5 * 60 * 1000) {
    console.log("Using cached exchange rates")
    return {
      rates: ratesCache.rates,
      timestamp: new Date(ratesCache.timestamp).toISOString(),
      source: "cache",
    }
  }

  try {
    // In a real app, this would be an API call
    // For demo purposes, we're using static data
    const rates = {
      USD: 1,
      ZAR: 18.87,
      EUR: 0.92,
      GBP: 0.79,
      AUD: 1.53,
      CAD: 1.34,
      JPY: 149.5,
      CHF: 0.89,
      CNY: 7.23,
      INR: 83.12,
    }

    // Update cache
    ratesCache = {
      timestamp: now,
      rates,
    }

    return {
      rates,
      timestamp: new Date().toISOString(),
      source: "api",
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error)

    // If cache exists but is expired, still use it as fallback
    if (ratesCache) {
      return {
        rates: ratesCache.rates,
        timestamp: new Date(ratesCache.timestamp).toISOString(),
        source: "fallback",
      }
    }

    // Last resort fallback
    return {
      rates: {
        USD: 1,
        ZAR: 18.87,
        EUR: 0.92,
        GBP: 0.79,
        AUD: 1.53,
        CAD: 1.34,
        JPY: 149.5,
        CHF: 0.89,
        CNY: 7.23,
        INR: 83.12,
      },
      timestamp: new Date().toISOString(),
      source: "fallback",
    }
  }
}

// Convert currency
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
) {
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error(`Invalid currency: ${fromCurrency} or ${toCurrency}`)
  }

  const fromRate = rates[fromCurrency]
  const toRate = rates[toCurrency]
  return (amount / fromRate) * toRate
}

// Rate limiting tracker
const rateLimiter = {
  requests: {} as Record<string, number[]>,
  maxRequests: 10, // Max requests per minute

  isAllowed: function (ip: string): boolean {
    const now = Date.now()
    const minute = 60 * 1000

    // Initialize if needed
    if (!this.requests[ip]) {
      this.requests[ip] = []
    }

    // Filter out requests older than 1 minute
    this.requests[ip] = this.requests[ip].filter((time) => now - time < minute)

    // Check if under limit
    if (this.requests[ip].length < this.maxRequests) {
      this.requests[ip].push(now)
      return true
    }

    return false
  },
}

// Check rate limit
export function checkRateLimit(ip: string): boolean {
  return rateLimiter.isAllowed(ip)
}

// Currency API object
export const currencyApi = {
  getExchangeRates: async (base: string, symbols: string[]) => ({ data: { rates: { USD: 1, EUR: 0.9 } }, error: null }),
}
