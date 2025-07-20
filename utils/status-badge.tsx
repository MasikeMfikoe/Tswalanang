import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Return a colored Badge describing the shipment status.
 * Colors follow the same heuristic used elsewhere in the app.
 */
export function getStatusBadge(status: string) {
  const s = status.toLowerCase()

  const colorClasses = (() => {
    if (s.includes("delivered") || s.includes("completed")) {
      return "bg-green-100 text-green-800"
    }
    if (s.includes("in transit") || s.includes("departed") || s.includes("arrived")) {
      return "bg-blue-100 text-blue-800"
    }
    if (s.includes("pending") || s.includes("exception") || s.includes("hold")) {
      return "bg-yellow-100 text-yellow-800"
    }
    if (s.includes("cancelled") || s.includes("failed")) {
      return "bg-red-100 text-red-800"
    }
    return "bg-gray-100 text-gray-800"
  })()

  return <Badge className={cn("capitalize", colorClasses)}>{status}</Badge>
}

export default getStatusBadge
