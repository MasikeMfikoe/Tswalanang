"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Charts } from "@/components/Charts"

export function OrderStatusCharts() {
  const orderStatusData = [
    { name: "Pending", value: 400 },
    { name: "In Transit", value: 300 },
    { name: "Delivered", value: 700 },
    { name: "Cancelled", value: 100 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Charts
            type="bar"
            title=""
            data={orderStatusData}
            xAxisDataKey="name"
            series={[{ dataKey: "value", color: "#8884d8", name: "Orders" }]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
