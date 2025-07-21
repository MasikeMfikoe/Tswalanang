import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, Clock, FileText } from "lucide-react"

export function PerformanceMetrics() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivery Target</CardTitle>
          <Gauge className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">95%</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Achieved last quarter</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Processing</CardTitle>
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24h Avg</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">From order to dispatch</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documentation Accuracy</CardTitle>
          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98%</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Error-free documents</p>
        </CardContent>
      </Card>
    </>
  )
}
