"use client"

import { useState, useEffect } from "react"
import { CreateOrder } from "@/components/CreateOrder" // Ensure this is a default export or named export
import { getCustomers } from "@/lib/api/customersApi"
import { getFreightTypes } from "@/lib/api/ordersApi" // Assuming this API exists for freight types
import type { Customer, FreightType } from "@/types/models" // Adjust path as necessary

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [freightTypes, setFreightTypes] = useState<FreightType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, freightTypesData] = await Promise.all([getCustomers(), getFreightTypes()])
        setCustomers(customersData.data)
        setFreightTypes(freightTypesData)
      } catch (err) {
        console.error("Failed to fetch initial data for CreateOrderPage:", err)
        setError("Failed to load necessary data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order creation form...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <CreateOrder customers={customers} freightTypes={freightTypes} />
    </div>
  )
}
