"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { defaultRates, defaultFreightTypes } from "@/lib/sample-rates"
import type { RateItem, FreightType } from "@/types/rates"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { RateCard } from "@/components/RateCard"

export default function RateCardPage() {
  const [rates, setRates] = useState<RateItem[]>(defaultRates)
  const [freightTypes, setFreightTypes] = useState<FreightType[]>(defaultFreightTypes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRate, setNewRate] = useState<Partial<RateItem>>({
    name: "",
    seaFreight: 0,
    airFreight: 0,
    isPercentage: false,
  })
  const [newFreightType, setNewFreightType] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = (id: string, updatedRate: RateItem) => {
    setRates(rates.map((rate) => (rate.id === id ? updatedRate : rate)))
    setEditingId(null)
    toast({
      title: "Success",
      description: "Rate updated successfully",
    })
  }

  const handleAddRate = () => {
    if (newRate.name) {
      const newRateItem: RateItem = {
        id: newRate.name.toLowerCase().replace(/\s+/g, "-"),
        name: newRate.name,
        seaFreight: Number(newRate.seaFreight) || 0,
        airFreight: Number(newRate.airFreight) || 0,
        isPercentage: newRate.isPercentage || false,
        percentageBase: newRate.isPercentage ? "totalDisbursements" : undefined,
      }
      setRates([...rates, newRateItem])
      setNewRate({
        name: "",
        seaFreight: 0,
        airFreight: 0,
        isPercentage: false,
      })
      toast({
        title: "Success",
        description: "New rate added successfully",
      })
    }
  }

  const handleAddFreightType = () => {
    if (newFreightType) {
      const newType: FreightType = {
        id: newFreightType.toLowerCase().replace(/\s+/g, "-"),
        name: newFreightType,
      }
      setFreightTypes([...freightTypes, newType])
      setNewFreightType("")
      toast({
        title: "Success",
        description: "New freight type added successfully",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Global Rate Card" description="Manage and view global shipping rates." />
      <RateCard />
    </div>
  )
}
