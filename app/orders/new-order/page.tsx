import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Create New Order" description="Fill in the details to create a new logistics order." />

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" placeholder="e.g., Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select>
                <SelectTrigger id="orderType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air Freight</SelectItem>
                  <SelectItem value="sea">Sea Freight</SelectItem>
                  <SelectItem value="road">Road Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" placeholder="e.g., Shanghai, China" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g., New York, USA" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="e.g., 500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (CBM)</Label>
              <Input id="volume" type="number" placeholder="e.g., 2.5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Goods Description</Label>
            <Textarea id="description" placeholder="e.g., Electronics, Textiles, etc." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea id="specialInstructions" placeholder="Any specific handling or delivery notes" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Create Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
