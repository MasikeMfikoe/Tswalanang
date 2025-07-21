"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RateCardEntry {
  id: string
  origin: string
  destination: string
  freightType: string
  ratePerKg: number
  ratePerCbm: number
  minCharge: number
  currency: string
}

export default function RateCardPage() {
  const [rateCard, setRateCard] = useState<RateCardEntry[]>([
    {
      id: "1",
      origin: "Shanghai",
      destination: "Rotterdam",
      freightType: "ocean",
      ratePerKg: 2.5,
      ratePerCbm: 150,
      minCharge: 500,
      currency: "USD",
    },
    {
      id: "2",
      origin: "New York",
      destination: "London",
      freightType: "air",
      ratePerKg: 5.0,
      ratePerCbm: 300,
      minCharge: 200,
      currency: "USD",
    },
  ])
  const { toast } = useToast()

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
    toast({
      title: "Row Removed",
      description: "The rate card entry has been removed.",
      variant: "destructive",
    })
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

  const handleSaveRateCard = () => {
    // In a real application, you would send this data to your backend API
    console.log("Saving Rate Card:", rateCard)
    toast({
      title: "Rate Card Saved",
      description: "Your rate card changes have been saved successfully.",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Global Rate Card</h1>
        <Button onClick={handleSaveRateCard}>
          <Save className="mr-2 h-4 w-4" /> Save Rate Card
        </Button>
      </header>
      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Manage Global Rates</CardTitle>
            <CardDescription>Define standard shipping rates for all customers.</CardDescription>
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
