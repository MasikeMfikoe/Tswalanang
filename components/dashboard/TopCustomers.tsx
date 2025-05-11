"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface TopCustomersProps {
  isDarkMode: boolean
  topCustomers: Array<{
    id: string
    name: string
    totalOrders: number
  }>
}

export function TopCustomers({ isDarkMode, topCustomers }: TopCustomersProps) {
  return (
    <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all mb-6`}>
      <CardHeader>
        <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Top Customers</CardTitle>
        <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
          Customers with the highest order volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topCustomers.map((customer, index) => (
            <div key={customer.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-600"
                    : index === 1
                      ? "bg-gray-100 text-gray-600"
                      : "bg-amber-100 text-amber-600"
                } mr-4 font-bold`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{customer.name}</h4>
                <div className="flex items-center mt-1">
                  <div className="flex-1 mr-4">
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(customer.totalOrders / topCustomers[0].totalOrders) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                    {customer.totalOrders} orders
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className={`${isDarkMode ? "hover:bg-zinc-700" : "hover:bg-gray-100"}`}>
                View
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            className={`${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white hover:bg-gray-100"}`}
          >
            View All Customers
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
