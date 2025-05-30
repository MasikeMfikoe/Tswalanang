"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { customersApi } from "@/lib/api/customersApi"
import { useQuery } from "@tanstack/react-query"

export default function DebugCustomersPage() {
  const [directFetchResult, setDirectFetchResult] = useState<any>(null)
  const [apiResult, setApiResult] = useState<any>(null)

  // Test the same query that EstimateForm uses
  const {
    data: customersData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("🔍 Starting customers query...")
      const response = await customersApi.getCustomers()
      console.log("📦 API Response:", response)
      return response.data || []
    },
  })

  const testDirectFetch = async () => {
    try {
      console.log("🚀 Testing direct fetch to /api/customers...")
      const response = await fetch("/api/customers")
      const data = await response.json()
      console.log("📡 Direct fetch response:", data)
      setDirectFetchResult({
        status: response.status,
        ok: response.ok,
        data: data,
      })
    } catch (error) {
      console.error("❌ Direct fetch error:", error)
      setDirectFetchResult({
        error: (error as Error).message,
      })
    }
  }

  const testCustomersApi = async () => {
    try {
      console.log("🔧 Testing customersApi.getCustomers()...")
      const response = await customersApi.getCustomers()
      console.log("🎯 CustomersApi response:", response)
      setApiResult(response)
    } catch (error) {
      console.error("❌ CustomersApi error:", error)
      setApiResult({
        error: (error as Error).message,
      })
    }
  }

  useEffect(() => {
    console.log("🔄 useQuery state changed:")
    console.log("- isLoading:", isLoading)
    console.log("- isError:", isError)
    console.log("- error:", error)
    console.log("- customersData:", customersData)
  }, [customersData, isLoading, error, isError])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Customers API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={testDirectFetch}>Test Direct Fetch (/api/customers)</Button>
        <Button onClick={testCustomersApi}>Test CustomersApi</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* useQuery Results */}
        <Card>
          <CardHeader>
            <CardTitle>useQuery Results (Same as EstimateForm)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
              </p>
              <p>
                <strong>Error:</strong> {isError ? "Yes" : "No"}
              </p>
              <p>
                <strong>Data Count:</strong> {customersData?.length || 0}
              </p>
              {error && (
                <div className="bg-red-100 p-2 rounded">
                  <strong>Error:</strong> {(error as Error).message}
                </div>
              )}
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(customersData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Direct Fetch Results */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Fetch Results</CardTitle>
          </CardHeader>
          <CardContent>
            {directFetchResult ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(directFetchResult, null, 2)}
              </pre>
            ) : (
              <p>Click "Test Direct Fetch" to see results</p>
            )}
          </CardContent>
        </Card>

        {/* API Results */}
        <Card>
          <CardHeader>
            <CardTitle>CustomersApi Results</CardTitle>
          </CardHeader>
          <CardContent>
            {apiResult ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            ) : (
              <p>Click "Test CustomersApi" to see results</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simple Dropdown Test */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Test (Same as EstimateForm)</CardTitle>
        </CardHeader>
        <CardContent>
          <select className="w-full p-2 border rounded">
            <option value="">Select a customer...</option>
            {customersData?.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-600">
            {customersData?.length ? `Found ${customersData.length} customers` : "No customers found"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
