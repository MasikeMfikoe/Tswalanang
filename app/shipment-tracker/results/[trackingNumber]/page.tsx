"use client"

import { useState, useEffect } from "react"
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults"

interface ShipmentTrackerResultsPageProps {
  params: Promise<{
    trackingNumber: string
  }>
  searchParams: {
    bookingType?: string
    carrierHint?: string
    preferScraping?: string
  }
}

export default function ShipmentTrackerResultsPage({ params, searchParams }: ShipmentTrackerResultsPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ trackingNumber: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  const { bookingType, carrierHint, preferScraping } = searchParams

  // Convert preferScraping to boolean
  const shouldPreferScraping = preferScraping === "true"

  if (!resolvedParams) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading tracking results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ShipmentTrackingResults
        trackingNumber={resolvedParams.trackingNumber}
        bookingType={bookingType as "ocean" | "air" | "lcl" | undefined}
        carrierHint={carrierHint}
        preferScraping={shouldPreferScraping}
      />
    </div>
  )
}
