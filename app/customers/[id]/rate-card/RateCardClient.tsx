"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { defaultRates, defaultFreightTypes } from "@/lib/sample-rates"
import type { RateItem, FreightType } from "@/types/rates"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Save, X } from "lucide-react"

export default function RateCardClient({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()

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

  useEffect(() => {
    // In a real app, fetch customer-specific rate card here using `id`
    // e.g. fetch(`/api/customers/${id}/rate-card`)
  }, [id])

  const handleSave = (rateId: string, updatedRate: RateItem) => {
    setRates(prev => prev.map(r => (r.id === rateId ? updatedRate : r)))
    setEditingId(null)
    toast({ title: "Success", description: "Rate updated successfully" })
  }

  const handleAddRate = () => {
    if (!newRate.name) return
    const newRateItem: RateItem = {
      id: newRate.name.toLowerCase().replace(/\s+/g, "-"),
      name: newRate.name,
      seaFreight: Number(newRate.seaFreight) || 0,
      airFreight: Number(newRate.airFreight) || 0,
      isPercentage: !!newRate.isPercentage,
      percentageBase: newRate.isPercentage ? "totalDisbursements" : undefined,
    }
    setRates(prev => [...prev, newRateItem])
    setNewRate({ name: "", seaFreight: 0, airFreight: 0, isPercentage: false })
    toast({ title: "Success", description: "New rate added successfully" })
  }

  const handleAddFreightType = () => {
    if (!newFreightType) return
    const newType: FreightType = {
      id: newFreightType.toLowerCase().replace(/\s+/g, "-"),
      name: newFreightType,
    }
    setFreightTypes(prev => [...prev, newType])
    setNewFreightType("")
    toast({ title: "Success", description: "New freight type added successfully" })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Rate Card</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Customer
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Rate</DialogTitle>
                <DialogDescription>Add a new rate to the customer's rate card.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Rate Name</Label>
                  <Input
                    id="name"
                    value={newRate.name}
                    onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="seaFreight">Sea Freight Rate</Label>
                    <Input
                      id="seaFreight"
                      type="number"
                      value={newRate.seaFreight}
                      onChange={(e) => setNewRate({ ...newRate, seaFreight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="airFreight">Air Freight Rate</Label>
                    <Input
                      id="airFreight"
                      type="number"
                      value={newRate.airFreight}
                      onChange={(e) => setNewRate({ ...newRate, airFreight: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPercentage"
                    checked={!!newRate.isPercentage}
                    onCheckedChange={(checked) => setNewRate({ ...newRate, isPercentage: !!checked })}
                  />
                  <Label htmlFor="isPercentage">Is Percentage</Label>
                </div>
                <Button onClick={handleAddRate}>Add Rate</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Customer Rates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rates.map((rate) => (
                <div key={rate.id} className="border rounded-lg p-4">
                  {editingId === rate.id ? (
                    <div className="space-y-4">
                      <Input
                        value={rate.name}
                        onChange={(e) => handleSave(rate.id, { ...rate, name: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Sea Freight</Label>
                          <Input
                            type="number"
                            value={rate.seaFreight}
                            onChange={(e) => handleSave(rate.id, { ...rate, seaFreight: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Air Freight</Label>
                          <Input
                            type="number"
                            value={rate.airFreight}
                            onChange={(e) => handleSave(rate.id, { ...rate, airFreight: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSave(rate.id, rate)}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{rate.name}</h3>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(rate.id)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sea Freight:</span>{" "}
                          {rate.isPercentage ? `${rate.seaFreight}%` : `R${rate.seaFreight}`}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Air Freight:</span>{" "}
                          {rate.isPercentage ? `${rate.airFreight}%` : `R${rate.airFreight}`}
                        </div>
                      </div>
                      {rate.isPercentage && (
                        <div className="text-sm text-muted-foreground">
                          Percentage based on: {rate.percentageBase}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Freight Types</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Freight Type</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="freightType">Freight Type Name</Label>
                      <Input
                        id="freightType"
                        value={newFreightType}
                        onChange={(e) => setNewFreightType(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddFreightType}>Add Freight Type</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {freightTypes.map((type) => (
                <div key={type.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <span>{type.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
