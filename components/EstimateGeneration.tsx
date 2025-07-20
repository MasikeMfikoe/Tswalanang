"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function EstimateGeneration() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [weight, setWeight] = useState("")
  const [volume, setVolume] = useState("")
  const [shipmentType, setShipmentType] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [estimate, setEstimate] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEstimate(null)
    setError(null)

    if (!origin || !destination || !weight || !volume || !shipmentType) {
      setError("Please fill in all required fields.")
      setLoading(false)
      return
    }

    try {
      // Simulate API call to generate estimate
      // In a real application, this would call your backend API
      // which would then integrate with external pricing APIs (e.g., SeaRates, Maersk)
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination,
          weight: Number.parseFloat(weight),
          volume: Number.parseFloat(volume),
          shipmentType,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate estimate.")
      }

      const data = await response.json()
      setEstimate(data.estimatedCost)
      toast({
        title: "Estimate Generated",
        description: `Estimated cost: $${data.estimatedCost.toFixed(2)}`,
        variant: "success",
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      toast({
        title: "Error",
        description: err.message || "Failed to generate estimate.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., Shanghai, China"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., New York, USA"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (CBM)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="e.g., 2.5"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipmentType">Shipment Type</Label>
            <Select value={shipmentType} onValueChange={setShipmentType} required>
              <SelectTrigger id="shipmentType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="air">Air Freight</SelectItem>
                <SelectItem value="ocean">Ocean Freight</SelectItem>
                <SelectItem value="road">Road Freight</SelectItem>
                <SelectItem value="rail">Rail Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Goods Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Electronics, Textiles, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" /> Generate Estimate
              </>
            )}
          </Button>
        </form>

        {estimate !== null && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <h3 className="text-lg font-semibold text-green-800">Estimated Cost:</h3>
            <p className="text-3xl font-bold text-green-700">${estimate.toFixed(2)}</p>
            <p className="text-sm text-green-600">This is an estimate and may vary.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
