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

  // Helper method to build URL
  private buildUrl(endpoint: string): string {
    // Ensure we have a valid base URL, default to relative path if not
    const baseUrl = this.config.baseUrl || ""

    // If baseUrl is empty or just "/", use relative paths
    if (!baseUrl || baseUrl === "/") {
      return endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }

    // Otherwise, properly join the baseUrl and endpoint
    const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
    const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    return `${formattedBaseUrl}${formattedEndpoint}`
  }

  // Helper method to handle fetch with timeout and retries
  private async fetchWithRetry(url: string, options: RequestInit, retries = this.config.maxRetries): Promise<Response> {
    try {
      // Create an abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      // Ensure we have a valid URL
      let validUrl: string
      try {
        // Check if it's a valid URL
        new URL(url)
        validUrl = url
      } catch (error) {
        // If not a valid URL, assume it's a relative path
        validUrl = url.startsWith("/") ? url : `/${url}`
        console.warn(`Invalid URL provided: ${url}, using relative path: ${validUrl}`)
      }

      const response = await fetch(validUrl, {
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
    const url = new URL(this.buildUrl(endpoint))

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value)
        }
      })
    }

    const response = await this.fetchWithRetry(url.toString(), {
      method: "GET",
      headers: this.config.headers,
    })

    return this.processResponse<T>(response)
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithRetry(this.buildUrl(endpoint), {
      method: "POST",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithRetry(this.buildUrl(endpoint), {
      method: "PUT",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithRetry(this.buildUrl(endpoint), {
      method: "PATCH",
      headers: this.config.headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.processResponse<T>(response)
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.fetchWithRetry(this.buildUrl(endpoint), {
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
export const apiClient = new ApiClient()

export type { ApiConfig }
