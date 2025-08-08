'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RateCardItem {
  id?: string
  service_type: string
  origin: string
  destination: string
  rate: number
  currency: string
  valid_from: string
  valid_to: string
  is_active: boolean
}

interface RateCardProps {
  customerId?: string
  readonly?: boolean
}

export default function RateCard({ customerId, readonly = false }: RateCardProps) {
  const [rates, setRates] = useState<RateCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const defaultRate: RateCardItem = {
    service_type: 'FCL',
    origin: '',
    destination: '',
    rate: 0,
    currency: 'USD',
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  }

  useEffect(() => {
    if (customerId) {
      fetchRates()
    } else {
      setLoading(false)
    }
  }, [customerId])

  const fetchRates = async () => {
    try {
      const response = await fetch(`/api/customers/rate-card?customerId=${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setRates(data)
      }
    } catch (error) {
      console.error('Error fetching rates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load rate card',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addRate = () => {
    setRates([...rates, { ...defaultRate }])
  }

  const updateRate = (index: number, field: keyof RateCardItem, value: any) => {
    const updatedRates = [...rates]
    updatedRates[index] = { ...updatedRates[index], [field]: value }
    setRates(updatedRates)
  }

  const removeRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index))
  }

  const saveRates = async () => {
    if (!customerId) return

    setSaving(true)
    try {
      const response = await fetch('/api/customers/rate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          rates
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Rate card saved successfully'
        })
        fetchRates()
      } else {
        throw new Error('Failed to save rate card')
      }
    } catch (error) {
      console.error('Error saving rates:', error)
      toast({
        title: 'Error',
        description: 'Failed to save rate card',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rate Card</CardTitle>
          {!readonly && (
            <div className="flex gap-2">
              <Button onClick={addRate} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Rate
              </Button>
              <Button onClick={saveRates} disabled={saving} size="sm">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No rates configured</p>
            {!readonly && (
              <Button onClick={addRate}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Rate
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rates.map((rate, index) => (
              <Card key={index} className="p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor={`service-${index}`}>Service Type</Label>
                    <Select
                      value={rate.service_type}
                      onValueChange={(value) => updateRate(index, 'service_type', value)}
                      disabled={readonly}
                    >
                      <SelectTrigger id={`service-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCL">FCL</SelectItem>
                        <SelectItem value="LCL">LCL</SelectItem>
                        <SelectItem value="Air">Air Freight</SelectItem>
                        <SelectItem value="Road">Road Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`origin-${index}`}>Origin</Label>
                    <Input
                      id={`origin-${index}`}
                      value={rate.origin}
                      onChange={(e) => updateRate(index, 'origin', e.target.value)}
                      placeholder="Origin port/city"
                      disabled={readonly}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`destination-${index}`}>Destination</Label>
                    <Input
                      id={`destination-${index}`}
                      value={rate.destination}
                      onChange={(e) => updateRate(index, 'destination', e.target.value)}
                      placeholder="Destination port/city"
                      disabled={readonly}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`rate-${index}`}>Rate</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`rate-${index}`}
                        type="number"
                        value={rate.rate}
                        onChange={(e) => updateRate(index, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        disabled={readonly}
                      />
                      <Select
                        value={rate.currency}
                        onValueChange={(value) => updateRate(index, 'currency', value)}
                        disabled={readonly}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`valid-from-${index}`}>Valid From</Label>
                    <Input
                      id={`valid-from-${index}`}
                      type="date"
                      value={rate.valid_from}
                      onChange={(e) => updateRate(index, 'valid_from', e.target.value)}
                      disabled={readonly}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`valid-to-${index}`}>Valid To</Label>
                    <Input
                      id={`valid-to-${index}`}
                      type="date"
                      value={rate.valid_to}
                      onChange={(e) => updateRate(index, 'valid_to', e.target.value)}
                      disabled={readonly}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`active-${index}`}
                      checked={rate.is_active}
                      onCheckedChange={(checked) => updateRate(index, 'is_active', checked)}
                      disabled={readonly}
                    />
                    <Label htmlFor={`active-${index}`}>Active</Label>
                  </div>

                  {!readonly && (
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRate(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                    {rate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {rate.origin} → {rate.destination}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
