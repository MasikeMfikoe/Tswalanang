import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, TrendingUp, Clock, CheckCircle } from "lucide-react"

const metrics = [
  {
    title: "On-Time Delivery Rate",
    value: "98.5%",
    description: "Target: 95%",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Average Transit Time",
    value: "3.2 Days",
    description: "Last Month: 3.5 Days",
    icon: Clock,
    color: "text-blue-500",
  },
  {
    title: "Customer Satisfaction",
    value: "4.7/5",
    description: "Based on recent surveys",
    icon: Gauge,
    color: "text-yellow-500",
  },
  {
    title: "Revenue Growth",
    value: "+15%",
    description: "Compared to previous quarter",
    icon: TrendingUp,
    color: "text-purple-500",
  },
]

export function PerformanceMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
