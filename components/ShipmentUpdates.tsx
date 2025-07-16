"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface VesselPosition {
  latitude: number
  longitude: number
  speed: number
  heading: number
  timestamp: string
}

interface ShipmentUpdatesProps {
  imo: string
}

const ShipmentUpdates: React.FC<ShipmentUpdatesProps> = ({ imo }) => {
  const [vesselPosition, setVesselPosition] = useState<VesselPosition | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVesselPosition = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/vessel-position?imo=${imo}`)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const { data } = await res.json()

        if (data && data.latitude && data.longitude) {
          setVesselPosition(data)
        } else {
          setError("No vessel position data found.")
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch vessel position.")
      } finally {
        setLoading(false)
      }
    }

    if (imo) {
      fetchVesselPosition()
    }
  }, [imo])

  if (loading) {
    return <div>Loading vessel position...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!vesselPosition) {
    return <div>No vessel position available.</div>
  }

  return (
    <div>
      <h3>Vessel Position</h3>
      <p>Latitude: {vesselPosition.latitude}</p>
      <p>Longitude: {vesselPosition.longitude}</p>
      <p>Speed: {vesselPosition.speed} knots</p>
      <p>Heading: {vesselPosition.heading} degrees</p>
      <p>Timestamp: {new Date(vesselPosition.timestamp).toLocaleString()}</p>
    </div>
  )
}

export default ShipmentUpdates
