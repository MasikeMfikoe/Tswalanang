"use client"

import { Search, Calendar, Bell, Sun, Moon, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
          Welcome back! Here's what's happening with your logistics operations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? "text-zinc-400" : "text-gray-400"}`}
          />
          <Input
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-9 w-[200px] ${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-gray-200"}`}
          />
        </div>

        {/* Date Range Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 ${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white hover:bg-gray-100"}`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {periodOptions.find((opt) => opt.value === selectedPeriod)?.label || "Select Period"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={`w-auto p-0 ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-white"}`}
            align="end"
          >
            <div className="p-2">
              <div className="grid grid-cols-2 gap-1 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => quickSelectDate(6)}
                  className={selectedPeriod === "last7days" ? "bg-primary text-primary-foreground" : ""}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => quickSelectDate(29)}
                  className={selectedPeriod === "last30days" ? "bg-primary text-primary-foreground" : ""}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPeriod("thisMonth")}
                  className={selectedPeriod === "thisMonth" ? "bg-primary text-primary-foreground" : ""}
                >
                  This Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPeriod("lastMonth")}
                  className={selectedPeriod === "lastMonth" ? "bg-primary text-primary-foreground" : ""}
                >
                  Last Month
                </Button>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <div>
                  <p className="text-xs font-medium mb-1">Start Date</p>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setSelectedPeriod("custom")
                    }}
                    className="w-[140px] h-8"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">End Date</p>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setSelectedPeriod("custom")
                    }}
                    className="w-[140px] h-8"
                  />
                </div>
              </div>

              {dateError && <p className="text-red-500 text-xs mt-1">End date must be after start date</p>}

              <Button className="w-full mt-2" size="sm" onClick={applyDateRange}>
                Apply Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`relative ${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white hover:bg-gray-100"}`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {notifications.filter((n) => !n.read).length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className={`w-80 p-0 ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-white"}`} align="end">
            <div className="p-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Notifications</h3>
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded-md ${!notification.read ? (isDarkMode ? "bg-zinc-700" : "bg-gray-100") : ""}`}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs opacity-70">{notification.time}</span>
                    </div>
                    <p className="text-xs mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className={`${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white hover:bg-gray-100"}`}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
