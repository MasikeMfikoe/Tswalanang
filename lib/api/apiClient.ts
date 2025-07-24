// Configuration for API requests
interface ApiConfig {
  baseUrl: string
  timeout: number
  maxRetries: number
  retryDelay: number
  headers?: Record<string, string>
}

// Default configuration
const defaultConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    "Content-Type": "application/json",
  },
}

// Error class for API errors
export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// API client class
export class ApiClient {
  private config: ApiConfig

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Helper method to build URL safely
  private buildUrl(endpoint: string): string {
    try {
      // Ensure we have a valid base URL, default to relative path if not
      const baseUrl = this.config.baseUrl || ""

      // If baseUrl is empty or just "/", use relative paths
      if (!baseUrl || baseUrl === "/") {
        return endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      }

      // Clean up the baseUrl and endpoint
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
      const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

      // Try to construct a proper URL
      try {
        const testUrl = new URL(cleanEndpoint, cleanBaseUrl)
        return testUrl.toString()
      } catch (urlError) {
        // If URL construction fails, fall back to simple concatenation
        console.warn(`URL construction failed, using fallback: ${cleanBaseUrl}${cleanEndpoint}`)
        return `${cleanBaseUrl}${cleanEndpoint}`
      }
    } catch (error) {
      // Ultimate fallback - just return the endpoint as a relative path
      console.warn(`URL building failed completely, using relative path: ${endpoint}`)
      return endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }
  }

  // Helper method to safely construct URL with parameters
  private buildUrlWithParams(endpoint: string, params?: Record<string, string>): string {
    try {
      const baseUrl = this.buildUrl(endpoint)

      // If no params, return the base URL
      if (!params || Object.keys(params).length === 0) {
        return baseUrl
      }

      // Try to use URL constructor for proper parameter handling
      try {
        const url = new URL(baseUrl, window.location.origin)
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value)
          }
        })
        return url.toString()
      } catch (urlError) {
        // Fallback to manual parameter construction
        const paramString = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&")

        const separator = baseUrl.includes("?") ? "&" : "?"
        return paramString ? `${baseUrl}${separator}${paramString}` : baseUrl
      }
    } catch (error) {
      console.warn(`Failed to build URL with params, using base endpoint: ${endpoint}`)
      return endpoint
    }
  }

  // Helper method to handle fetch with timeout and retries
  private async fetchWithRetry(url: string, options: RequestInit, retries = this.config.maxRetries): Promise<Response> {
    try {
      // Create an abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // If response is not ok and we have retries left, retry the request
      if (!response.ok && retries > 0) {
        console.warn(`Request failed with status ${response.status}. Retrying... (${retries} retries left)`)
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      return response
    } catch (error) {
      // If we have retries left and it's not an abort error, retry the request
      if (retries > 0 && error instanceof Error && error.name !== "AbortError") {
        console.warn(`Request failed with error: ${error.message}. Retrying... (${retries} retries left)`)
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay))
        return this.fetchWithRetry(url, options, retries - 1)
      }

      // If it's an abort error, it's a timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408)
      }

      throw error
    }
  }

  // Helper method to process response
  private async processResponse<T>(response: Response): Promise<T> {
    try {
      const contentType = response.headers.get("content-type")

      // If response is not JSON, return text
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        if (!response.ok) {
          throw new ApiError(text, response.status)
        }
        return text as unknown as T
      }

      const data = await response.json()

      // If response is not ok, throw an error
      if (!response.ok) {
        throw new ApiError(data.message || data.error || "An error occurred", response.status, data)
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(error instanceof Error ? error.message : "An unknown error occurred", 500)
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrlWithParams(endpoint, params)
    console.log(`GET ${url}`)

    const response = await this.fetchWithRetry(url, {
      method: "GET",
      headers: this.config.headers,
    })

    return this.processResponse<T>(response)
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint)
    console.log(`POST ${url}`, data)

    const response = await this.fetchWithRetry(url, {
      method: "POST",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint)
    console.log(`PUT ${url}`, data)

    const response = await this.fetchWithRetry(url, {
      method: "PUT",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint)
    console.log(`PATCH ${url}`, data)

    const response = await this.fetchWithRetry(url, {
      method: "PATCH",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint)
    console.log(`DELETE ${url}`)

    const response = await this.fetchWithRetry(url, {
      method: "DELETE",
      headers: this.config.headers,
    })

    return this.processResponse<T>(response)
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Remove Content-Type header to let the browser set it with the boundary
    const headers = { ...this.config.headers }
    delete headers["Content-Type"]

    const response = await this.fetchWithRetry(this.buildUrl(endpoint), {
      method: "POST",
      headers,
      body: formData,
    })

    return this.processResponse<T>(response)
  }
}

// Create and export a singleton instance
export const apiClientInstance = new ApiClient()

export type { ApiConfig }
