// app/shipment-tracker/results/[trackingNumber]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults";

export default function ShipmentTrackerResultsPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const search = useSearchParams();

  const bookingTypeParam = search.get("bookingType");
  const bookingType =
    bookingTypeParam === "ocean" || bookingTypeParam === "air" || bookingTypeParam === "lcl"
      ? bookingTypeParam
      : undefined;

  const carrierHint = search.get("carrierHint") || undefined;
  const preferScraping = search.get("preferScraping") === "true";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ShipmentTrackingResults
        trackingNumber={trackingNumber}
        bookingType={bookingType}
        carrierHint={carrierHint}
        preferScraping={preferScraping}
      />
    </div>
  );
}
