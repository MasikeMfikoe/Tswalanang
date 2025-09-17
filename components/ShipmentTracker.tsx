"use client";

import { useState } from "react";

type TrackingEvent = {
  display_event?: string;
  actual_date?: string | null;
  location?: string | null;
};

type TrackingData = {
  status?: string;
  reference_no?: string;
  pol_name?: string;
  pod_name?: string;
  events?: TrackingEvent[];
};

type BookingType = "ocean" | "air" | "lcl";

export default function ShipmentTracker() {
  const [number, setNumber] = useState("");
  const [bookingType, setBookingType] = useState<BookingType | "">("");
  const [carrierHint, setCarrierHint] = useState("");
  const [preferScraping, setPreferScraping] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Explicit typing fixes “Property 'status' does not exist on type 'never'”
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const trackShipment = async () => {
    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: number,
          bookingType: (bookingType || undefined) as BookingType | undefined,
          carrierHint: carrierHint || undefined,
          preferScraping,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not fetch tracking data.");
      }

      setTrackingData(json.data as TrackingData);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Could not fetch tracking data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded shadow bg-white w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Track Your Shipment</h2>

      <div className="grid gap-3 md:grid-cols-2 mb-3">
        <input
          type="text"
          placeholder="Container / BL / AWB / Ref #"
          className="border p-2 rounded w-full"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full"
          value={bookingType}
          onChange={(e) => setBookingType(e.target.value as BookingType | "")}
        >
          <option value="">Booking Type (optional)</option>
          <option value="ocean">Ocean</option>
          <option value="air">Air</option>
          <option value="lcl">LCL</option>
        </select>
        <input
          type="text"
          placeholder="Carrier hint (optional)"
          className="border p-2 rounded w-full"
          value={carrierHint}
          onChange={(e) => setCarrierHint(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={preferScraping}
            onChange={(e) => setPreferScraping(e.target.checked)}
          />
          Prefer scraping
        </label>
      </div>

      <button
        onClick={trackShipment}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={!number || loading}
      >
        {loading ? "Tracking..." : "Track"}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {trackingData && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold">Tracking Info</h3>
          <p>
            <strong>Status:</strong> {trackingData.status ?? "—"}
          </p>
          <p>
            <strong>Reference No:</strong> {trackingData.reference_no ?? "—"}
          </p>
          <p>
            <strong>POL:</strong> {trackingData.pol_name ?? "—"}
          </p>
          <p>
            <strong>POD:</strong> {trackingData.pod_name ?? "—"}
          </p>

          <h4 className="mt-3 font-semibold">Events</h4>
          {trackingData.events?.length ? (
            <ul className="list-disc pl-5 text-sm">
              {trackingData.events.map((ev, i) => (
                <li key={i}>
                  {ev.display_event ?? "Event"} — {ev.actual_date || "Pending"} @ {ev.location || "—"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No events yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
