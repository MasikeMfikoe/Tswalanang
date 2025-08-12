"use client"

import { useState } from "react"
import axios from "axios"

export default function ShipmentTracker() {
  const [number, setNumber] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [trackingData, setTrackingData] = useState(null)
  const [error, setError] = useState("")

  const getToken = async () => {
    const res = await axios.post("https://login.gocomet.com/api/v1/integrations/generate-token-number", {
      email: "ofentse@tlogistics.net.za",
      password: "Tswa#@2025",
    })
    return res.data.token
  }

  const trackShipment = async () => {
    setLoading(true)
    setError("")
    try {
      const currentToken = token || (await getToken())
      setToken(currentToken)
      const response = await axios.get(`https://tracking.gocomet.com/api/v1/integrations/live-tracking`, {
        params: {
          start_date: "01/01/2024",
          "tracking_numbers[]": number,
          token: currentToken,
        },
      })
      const result = response.data.updated_trackings?.[0]
      setTrackingData(result || null)
    } catch (err) {
      console.error(err)
      setError("Could not fetch tracking data.")
      setTrackingData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-2">Track Your Shipment</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter container or BL number"
          className="border p-2 rounded w-full"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button onClick={trackShipment} className="bg-blue-600 text-white px-4 py-2 rounded">
          Track
        </button>
      </div>
      {loading && <p className="mt-4 text-gray-500">Loading tracking data...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {trackingData && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold">Tracking Info</h3>
          <p>
            <strong>Status:</strong> {trackingData.status}
          </p>
          <p>
            <strong>Reference No:</strong> {trackingData.reference_no}
          </p>
          <p>
            <strong>POL:</strong> {trackingData.pol_name}
          </p>
          <p>
            <strong>POD:</strong> {trackingData.pod_name}
          </p>
          <h4 className="mt-2 font-semibold">Events:</h4>
          <ul className="list-disc pl-5 text-sm">
            {trackingData.events?.map((event, i) => (
              <li key={i}>
                {event.display_event} - {event.actual_date || "Pending"} @ {event.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
