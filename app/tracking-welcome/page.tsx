import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export default function TrackingWelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50">Welcome to Smartlog Tracking</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Track your shipments with ease and get real-time updates.
        </p>
        <div className="relative w-full max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter your tracking number"
            className="w-full py-3 pl-4 pr-12 rounded-full bg-white shadow-md"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-gray-200"
            aria-label="search"
          >
            <Search className="h-6 w-6 text-gray-700" />
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Or{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            log in
          </Link>{" "}
          to view your dashboard.
        </p>
      </div>
    </div>
  )
}
