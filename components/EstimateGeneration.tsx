"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface EstimateResult {
  estimatedCost: number
  estimatedPrice: number
  currency: string
  details: string
}

export function EstimateGeneration() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [weight, setWeight] = useState("")
  const [volume, setVolume] = useState("")
  const [freightType, setFreightType] = useState("")
  const [customer, setCustomer] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const { toast } = useToast()

  const handleGenerateEstimate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || (!weight && !volume) || !freightType || !customer) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Origin, Destination, Weight/Volume, Freight Type, Customer).",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setEstimate(null)
    toast({
      title: "Generating Estimate",
      description: "Calculating your shipment estimate...",
      duration: 3000,
    })

    try {
      // Simulate API call to a backend service for estimate generation
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination,
          weight: Number.parseFloat(weight) || 0,
          volume: Number.parseFloat(volume) || 0,
          freightType,
          customer,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate estimate.")
      }

      const data: EstimateResult = await response.json()
      setEstimate(data)
      toast({
        title: "Estimate Generated!",
        description: "Your shipment estimate is ready.",
      })
    } catch (error: any) {
      console.error("Error generating estimate:", error)
      toast({
        title: "Estimate Generation Failed",
        description: error.message || "There was an error generating the estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Shipment Estimate</CardTitle>
        <CardDescription>Get an estimated cost and price for your shipment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleGenerateEstimate} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              placeholder="e.g., Shanghai"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Rotterdam"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freight-type">Freight Type</Label>
            <Select value={freightType} onValueChange={setFreightType}>
              <SelectTrigger id="freight-type">
                <SelectValue placeholder="Select freight type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="air">Air Freight</SelectItem>
                <SelectItem value="ocean">Ocean Freight</SelectItem>
                <SelectItem value="road">Road Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme Corp</SelectItem>
                <SelectItem value="global">Global Logistics</SelectItem>
                <SelectItem value="tech">Tech Solutions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Estimate"
              )}
            </Button>
          </div>
        </form>

        {estimate && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" /> Estimated Costs
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Estimated Cost:</span> {estimate.currency}{" "}
                {estimate.estimatedCost.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Estimated Price:</span> {estimate.currency}{" "}
                {estimate.estimatedPrice.toFixed(2)}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Details:</span> {estimate.details}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
