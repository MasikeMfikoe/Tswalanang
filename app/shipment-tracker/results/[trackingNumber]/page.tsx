"use client"

import ShipmentTrackingResults from "@/components/ShipmentTrackingResults"

interface ShipmentTrackerResultsPageProps {
  params: {
    trackingNumber: string
  }
  searchParams: {
    bookingType?: string
    carrierHint?: string
    preferScraping?: string
  }
}

export default function ShipmentTrackerResultsPage({
  params,
  searchParams,
}: ShipmentTrackerResultsPageProps) {
  const { trackingNumber } = params
  const { bookingType, carrierHint, preferScraping } = searchParams

  // Convert preferScraping to boolean
  const shouldPreferScraping = preferScraping === "true"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ShipmentTrackingResults
        trackingNumber={trackingNumber}
        bookingType={bookingType as "ocean" | "air" | "lcl" | undefined}
        carrierHint={carrierHint}
        preferScraping={shouldPreferScraping}
      />
    </div>
  )
}
