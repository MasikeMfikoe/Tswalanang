import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SimpleNestedPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Simple Nested Page</h2>
      <p className="text-gray-600">This is a simple page nested within the /orders/new layout.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" placeholder="Enter value for field 1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" placeholder="Enter value for field 2" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Submit</Button>
      </div>
    </div>
  )
}
