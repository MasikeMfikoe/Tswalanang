"use client"

import { Search, Calendar, Bell, Sun, Moon, ChevronDown, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  isDarkMode: boolean
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedPeriod: string
  periodOptions: Array<{
    label: string
    value: string
  }>
  setSelectedPeriod: (value: string) => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  quickSelectDate: (days: number) => void
  applyDateRange: () => void
  showNotifications: boolean
  setShowNotifications: (value: boolean) => void
  notifications: Array<{
    id: number
    title: string
    message: string
    time: string
    read: boolean
  }>
  markAllAsRead: () => void
  toggleTheme: () => void
  dateError?: boolean
}

export function DashboardHeader({
  isDarkMode,
  searchTerm,
  setSearchTerm,
  selectedPeriod,
  periodOptions,
  setSelectedPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  quickSelectDate,
  applyDateRange,
  showNotifications,
  setShowNotifications,
  notifications,
  markAllAsRead,
  toggleTheme,
  dateError,
}: DashboardHeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      className={`${isDarkMode ? "bg-gradient-to-r from-slate-900/50 to-gray-900/50 border-b border-slate-800/50" : "bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200"} -mx-6 -mt-6 px-6 py-6 mb-8`}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Title Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isDarkMode ? "bg-cyan-500/20" : "bg-cyan-100"}`}>
              <div
                className={`w-6 h-6 rounded-lg ${isDarkMode ? "bg-gradient-to-br from-cyan-400 to-blue-500" : "bg-gradient-to-br from-cyan-500 to-blue-600"}`}
              />
            </div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>CRM Dashboard</h1>
            <Badge
              variant="secondary"
              className={`${isDarkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"}`}
            >
              Live
            </Badge>
          </div>
          <p className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Comprehensive overview of your logistics operations and customer relationships
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Enhanced Search */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <Input
              placeholder="Search orders, customers, shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 w-[280px] ${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-400" : "bg-white/80 border-gray-300 placeholder:text-gray-500"} focus:ring-2 focus:ring-cyan-500/20`}
            />
          </div>

          {/* Advanced Date Range Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`flex items-center gap-2 min-w-[160px] ${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50" : "bg-white/80 border-gray-300 hover:bg-gray-50"}`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {periodOptions.find((opt) => opt.value === selectedPeriod)?.label || "Select Period"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={`w-auto p-0 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
              align="end"
            >
              <div className="p-4">
                <h4 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Select Time Period
                </h4>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Last 7 days", days: 6, value: "last7days" },
                    { label: "Last 30 days", days: 29, value: "last30days" },
                    { label: "This Month", value: "thisMonth" },
                    { label: "Last Month", value: "lastMonth" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => (option.days ? quickSelectDate(option.days) : setSelectedPeriod(option.value))}
                      className={`justify-start ${selectedPeriod === option.value ? "bg-cyan-500/20 text-cyan-600" : ""}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`text-xs font-medium mb-1 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          setSelectedPeriod("custom")
                        }}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label
                        className={`text-xs font-medium mb-1 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value)
                          setSelectedPeriod("custom")
                        }}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {dateError && <p className="text-red-500 text-xs">End date must be after start date</p>}

                  <Button
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    size="sm"
                    onClick={applyDateRange}
                  >
                    Apply Date Range
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Enhanced Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`relative ${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50" : "bg-white/80 border-gray-300 hover:bg-gray-50"}`}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={`w-96 p-0 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
              align="end"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Notifications</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          !notification.read
                            ? isDarkMode
                              ? "bg-cyan-500/10 border-cyan-500/20"
                              : "bg-cyan-50 border-cyan-200"
                            : isDarkMode
                              ? "bg-slate-700/50 border-slate-600/50"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {notification.title}
                          </h4>
                          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {notification.time}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        No notifications yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50" : "bg-white/80 border-gray-300 hover:bg-gray-50"}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={`${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50" : "bg-white/80 border-gray-300 hover:bg-gray-50"}`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
