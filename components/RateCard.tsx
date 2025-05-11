"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface RateCardProps {
  customerId?: string
  isNewCustomer?: boolean
  initialData?: {
    seaFreight?: {
      communicationFee: number
      documentationFee: number
      agencyFee: number
      facilityFee: number
    }
    airFreight?: {
      communicationFee: number
      documentationFee: number
      agencyFee: number
      facilityFee: number
    }
  }
}

export function RateCard({ customerId, isNewCustomer = false, initialData }: RateCardProps) {
  const { toast } = useToast()

  // Default values for sea and air freight
  const defaultSeaFreight = useMemo(
    () => ({
      communicationFee: 350,
      documentationFee: 350,
      agencyFee: 3.5,
      facilityFee: 2.5,
    }),
    [],
  )

  const defaultAirFreight = useMemo(
    () => ({
      communicationFee: 150,
      documentationFee: 250,
      agencyFee: 3.5,
      facilityFee: 2.5,
    }),
    [],
  )

  // Initialize state with default values or provided initialData
  const [seaFreight, setSeaFreight] = useState(initialData?.seaFreight || defaultSeaFreight)

  const [airFreight, setAirFreight] = useState(initialData?.airFreight || defaultAirFreight)

  const [loading, setLoading] = useState(false)
  const [activeFreightTab, setActiveFreightTab] = useState("seaFreight")

  // Memoized handlers to prevent unnecessary re-renders
  const handleSeaFreightChange = useCallback((field: string, value: string) => {
    setSeaFreight((prev) => ({
      ...prev,
      [field]:
        field.includes("Fee") && !field.includes("documentation") && !field.includes("communication")
          ? Number.parseFloat(value)
          : Number.parseInt(value, 10),
    }))
  }, [])

  const handleAirFreightChange = useCallback((field: string, value: string) => {
    setAirFreight((prev) => ({
      ...prev,
      [field]:
        field.includes("Fee") && !field.includes("documentation") && !field.includes("communication")
          ? Number.parseFloat(value)
          : Number.parseInt(value, 10),
    }))
  }, [])

  const handleSave = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Success",
        description: "Rate card saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rate card",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Memoized form components to prevent unnecessary re-renders
  const SeaFreightForm = useMemo(
    () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seaCommunicationFee">Communication Fee (R)</Label>
            <Input
              id="seaCommunicationFee"
              type="number"
              value={seaFreight.communicationFee}
              onChange={(e) => handleSeaFreightChange("communicationFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seaDocumentationFee">Documentation Fee (R)</Label>
            <Input
              id="seaDocumentationFee"
              type="number"
              value={seaFreight.documentationFee}
              onChange={(e) => handleSeaFreightChange("documentationFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seaAgencyFee">Agency Fee (%)</Label>
            <Input
              id="seaAgencyFee"
              type="number"
              step="0.1"
              value={seaFreight.agencyFee}
              onChange={(e) => handleSeaFreightChange("agencyFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seaFacilityFee">Facility Fee (%)</Label>
            <Input
              id="seaFacilityFee"
              type="number"
              step="0.1"
              value={seaFreight.facilityFee}
              onChange={(e) => handleSeaFreightChange("facilityFee", e.target.value)}
            />
          </div>
        </div>
      </div>
    ),
    [seaFreight, handleSeaFreightChange],
  )

  const AirFreightForm = useMemo(
    () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airCommunicationFee">Communication Fee (R)</Label>
            <Input
              id="airCommunicationFee"
              type="number"
              value={airFreight.communicationFee}
              onChange={(e) => handleAirFreightChange("communicationFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airDocumentationFee">Documentation Fee (R)</Label>
            <Input
              id="airDocumentationFee"
              type="number"
              value={airFreight.documentationFee}
              onChange={(e) => handleAirFreightChange("documentationFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airAgencyFee">Agency Fee (%)</Label>
            <Input
              id="airAgencyFee"
              type="number"
              step="0.1"
              value={airFreight.agencyFee}
              onChange={(e) => handleAirFreightChange("agencyFee", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airFacilityFee">Facility Fee (%)</Label>
            <Input
              id="airFacilityFee"
              type="number"
              step="0.1"
              value={airFreight.facilityFee}
              onChange={(e) => handleAirFreightChange("facilityFee", e.target.value)}
            />
          </div>
        </div>
      </div>
    ),
    [airFreight, handleAirFreightChange],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Rate Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFreightTab} onValueChange={setActiveFreightTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seaFreight">Sea Freight</TabsTrigger>
            <TabsTrigger value="airFreight">Air Freight</TabsTrigger>
          </TabsList>
          <TabsContent value="seaFreight" className="mt-4">
            {SeaFreightForm}
          </TabsContent>
          <TabsContent value="airFreight" className="mt-4">
            {AirFreightForm}
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Rate Card"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
