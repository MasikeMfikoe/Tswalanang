import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 1: Basic Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Goods Description</Label>
          <Textarea id="description" placeholder="e.g., Electronics, Machinery parts" rows={3} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Next Step</Button>
      </div>
    </div>
  )
}
