"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabaseClient"

interface RateCardProps {
  customerId?: string
  isNewCustomer?: boolean
  isEditable?: boolean
  onChange?: (data: any) => void
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

interface RateCardData {
  id?: string
  customer_id: string
  sea_freight_communication_fee: number
  sea_freight_documentation_fee: number
  sea_freight_agency_fee: number
  sea_freight_facility_fee: number
  air_freight_communication_fee: number
  air_freight_documentation_fee: number
  air_freight_agency_fee: number
  air_freight_facility_fee: number
  created_at?: string
  updated_at?: string
}

export function RateCard({
  customerId,
  isNewCustomer = false,
  isEditable = true,
  onChange,
  initialData,
}: RateCardProps) {
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

  // State management
  const [seaFreight, setSeaFreight] = useState(initialData?.seaFreight || defaultSeaFreight)
  const [airFreight, setAirFreight] = useState(initialData?.airFreight || defaultAirFreight)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeFreightTab, setActiveFreightTab] = useState("seaFreight")
  const [rateCardId, setRateCardId] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  // Check if customer_rate_cards table exists
  const checkTableExists = useCallback(async () => {
    try {
      const { error } = await supabase.from("customer_rate_cards").select("id").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist
        setTableExists(false)
        return false
      }

      setTableExists(true)
      return true
    } catch (error) {
      console.error("Error checking table existence:", error)
      setTableExists(false)
      return false
    }
  }, [])

  // Fetch existing rate card data
  const fetchRateCard = useCallback(async () => {
    if (!customerId || isNewCustomer) return

    try {
      setLoading(true)

      // First check if table exists
      const exists = await checkTableExists()
      if (!exists) {
        console.log("customer_rate_cards table does not exist, using default values")
        return
      }

      const { data, error } = await supabase
        .from("customer_rate_cards")
        .select("*")
        .eq("customer_id", customerId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setRateCardId(data.id)
        setSeaFreight({
          communicationFee: data.sea_freight_communication_fee,
          documentationFee: data.sea_freight_documentation_fee,
          agencyFee: data.sea_freight_agency_fee,
          facilityFee: data.sea_freight_facility_fee,
        })
        setAirFreight({
          communicationFee: data.air_freight_communication_fee,
          documentationFee: data.air_freight_documentation_fee,
          agencyFee: data.air_freight_agency_fee,
          facilityFee: data.air_freight_facility_fee,
        })
      }
    } catch (error: any) {
      console.error("Error fetching rate card:", error)
      if (error.code === "42P01") {
        setTableExists(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch rate card data",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [customerId, isNewCustomer, toast, checkTableExists])

  // Load rate card data on mount
  useEffect(() => {
    fetchRateCard()
  }, [fetchRateCard])

  // Memoized handlers to prevent unnecessary re-renders
  const handleSeaFreightChange = useCallback(
    (field: string, value: string) => {
      if (!isEditable) return

      setSeaFreight((prev) => ({
        ...prev,
        [field]:
          field.includes("Fee") && !field.includes("documentation") && !field.includes("communication")
            ? Number.parseFloat(value) || 0
            : Number.parseInt(value, 10) || 0,
      }))
    },
    [isEditable],
  )

  const handleAirFreightChange = useCallback(
    (field: string, value: string) => {
      if (!isEditable) return

      setAirFreight((prev) => ({
        ...prev,
        [field]:
          field.includes("Fee") && !field.includes("documentation") && !field.includes("communication")
            ? Number.parseFloat(value) || 0
            : Number.parseInt(value, 10) || 0,
      }))
    },
    [isEditable],
  )

  const handleSave = useCallback(async () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "Customer ID is required to save rate card",
        variant: "destructive",
      })
      return
    }

    if (!tableExists) {
      toast({
        title: "Error",
        description: "Rate card table not available. Please run the database migration first.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const rateCardData: Partial<RateCardData> = {
        customer_id: customerId,
        sea_freight_communication_fee: seaFreight.communicationFee,
        sea_freight_documentation_fee: seaFreight.documentationFee,
        sea_freight_agency_fee: seaFreight.agencyFee,
        sea_freight_facility_fee: seaFreight.facilityFee,
        updated_at: new Date().toISOString(),
      }

      let result
      if (rateCardId) {
        // Update existing rate card
        result = await supabase.from("customer_rate_cards").update(rateCardData).eq("id", rateCardId).select().single()
      } else {
        // Create new rate card
        rateCardData.created_at = new Date().toISOString()
        result = await supabase.from("customer_rate_cards").insert(rateCardData).select().single()
      }

      if (result.error) {
        throw result.error
      }

      if (result.data && !rateCardId) {
        setRateCardId(result.data.id)
      }

      toast({
        title: "Success",
        description: "Rate card saved successfully",
      })
    } catch (error: any) {
      console.error("Error saving rate card:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save rate card",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [customerId, seaFreight, airFreight, rateCardId, tableExists, toast])

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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seaDocumentationFee">Documentation Fee (R)</Label>
            <Input
              id="seaDocumentationFee"
              type="number"
              value={seaFreight.documentationFee}
              onChange={(e) => handleSeaFreightChange("documentationFee", e.target.value)}
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
            />
          </div>
        </div>
      </div>
    ),
    [seaFreight, handleSeaFreightChange, isEditable],
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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airDocumentationFee">Documentation Fee (R)</Label>
            <Input
              id="airDocumentationFee"
              type="number"
              value={airFreight.documentationFee}
              onChange={(e) => handleAirFreightChange("documentationFee", e.target.value)}
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
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
              disabled={!isEditable}
              className={!isEditable ? "bg-gray-50" : ""}
            />
          </div>
        </div>
      </div>
    ),
    [airFreight, handleAirFreightChange, isEditable],
  )

  useEffect(() => {
    if (onChange && isNewCustomer) {
      onChange({
        seaFreight,
        airFreight,
      })
    }
  }, [seaFreight, airFreight, onChange, isNewCustomer])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
            <span className="ml-2">Loading rate card...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Rate Card</CardTitle>
        {!tableExists && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
            <p className="text-sm text-yellow-800">
              Rate card database table not found. Using default values. Run the database migration to enable rate card
              storage.
            </p>
          </div>
        )}
        {!isEditable && (
          <p className="text-sm text-gray-500">Rate card is read-only. Click "Edit Details" to make changes.</p>
        )}
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
        {isEditable && tableExists && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Rate Card"}
            </Button>
          </div>
        )}
        {isEditable && !tableExists && (
          <div className="mt-6 flex justify-end">
            <Button disabled>Save Rate Card (Table Missing)</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
