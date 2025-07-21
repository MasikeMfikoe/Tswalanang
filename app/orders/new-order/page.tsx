import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create New Order (Direct)</h1>
      </header>
      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Fill in the details for the new shipment order.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select>
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
            <div className="space-y-2">
              <Label htmlFor="order-date">Order Date</Label>
              <Input id="order-date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" placeholder="e.g., Shanghai, China" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g., Rotterdam, Netherlands" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freight-type">Freight Type</Label>
              <Select>
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
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="e.g., 500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (CBM)</Label>
              <Input id="volume" type="number" placeholder="e.g., 2.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pieces">Number of Pieces</Label>
              <Input id="pieces" type="number" placeholder="e.g., 10" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Goods Description</Label>
              <Textarea id="description" placeholder="e.g., Electronics, Machinery parts" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Tracking Number (Optional)</Label>
              <Input id="tracking-number" placeholder="Auto-generated if left blank" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier (Optional)</Label>
              <Input id="carrier" placeholder="e.g., Maersk, DHL" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="special-instructions">Special Instructions (Optional)</Label>
              <Textarea id="special-instructions" placeholder="e.g., Handle with care, Fragile" rows={2} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>
              <Button>Create Order</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
