"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCustomerRateCard, updateCustomerRateCard } from "@/lib/api/customersApi" // Assuming these API functions exist
import type { RateCardEntry } from "@/types/rates" // Assuming this type exists

export default function CustomerRateCardPage() {
  const { id } = useParams()
  const customerId = Array.isArray(id) ? id[0] : id
  const [rateCard, setRateCard] = useState<RateCardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (customerId) {
      fetchRateCard(customerId)
    }
  }, [customerId])

  const fetchRateCard = async (custId: string) => {
    setLoading(true)
    try {
      const data = await getCustomerRateCard(custId)
      setRateCard(data || []) // Ensure it's an array, even if null/undefined
    } catch (error) {
      console.error("Failed to fetch rate card:", error)
      toast({
        title: "Error",
        description: "Failed to load rate card. Please try again.",
        variant: "destructive",
      })
      setRateCard([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddRow = () => {
    setRateCard([
      ...rateCard,
      {
        id: `new-${Date.now()}`,
        origin: "",
        destination: "",
        freightType: "",
        ratePerKg: 0,
        ratePerCbm: 0,
        minCharge: 0,
        currency: "USD",
      },
    ])
  }

  const handleRemoveRow = (idToRemove: string) => {
    setRateCard(rateCard.filter((row) => row.id !== idToRemove))
  }

  const handleInputChange = (id: string, field: keyof RateCardEntry, value: string | number) => {
    setRateCard(
      rateCard.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "ratePerKg" || field === "ratePerCbm" || field === "minCharge"
                  ? Number.parseFloat(value as string) || 0
                  : value,
            }
          : row,
      ),
    )
  }

  const handleSaveRateCard = async () => {
    if (!customerId) return

    setSaving(true)
    try {
      await updateCustomerRateCard(customerId, rateCard)
      toast({
        title: "Success",
        description: "Rate card updated successfully!",
      })
      // Re-fetch to ensure consistency and get server-assigned IDs for new entries
      fetchRateCard(customerId)
    } catch (error) {
      console.error("Failed to save rate card:", error)
      toast({
        title: "Error",
        description: "Failed to save rate card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading rate card...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Rate Card for Customer {customerId}</h1>
        <Button onClick={handleSaveRateCard} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Rate Card"}
        </Button>
      </header>
      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Manage Rates</CardTitle>
            <CardDescription>Define specific shipping rates for this customer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Freight Type</TableHead>
                  <TableHead>Rate/Kg</TableHead>
                  <TableHead>Rate/CBM</TableHead>
                  <TableHead>Min Charge</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateCard.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input value={row.origin} onChange={(e) => handleInputChange(row.id, "origin", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.destination}
                        onChange={(e) => handleInputChange(row.id, "destination", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.freightType}
                        onValueChange={(value) => handleInputChange(row.id, "freightType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="air">Air Freight</SelectItem>
                          <SelectItem value="ocean">Ocean Freight</SelectItem>
                          <SelectItem value="road">Road Freight</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.ratePerKg}
                        onChange={(e) => handleInputChange(row.id, "ratePerKg", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.ratePerCbm}
                        onChange={(e) => handleInputChange(row.id, "ratePerCbm", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.minCharge}
                        onChange={(e) => handleInputChange(row.id, "minCharge", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.currency}
                        onValueChange={(value) => handleInputChange(row.id, "currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(row.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleAddRow} className="mt-4 w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Row
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
