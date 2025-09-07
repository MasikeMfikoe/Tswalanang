"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface TrackShipmentEmbedProps {
  submittedContainer: string
}

const TrackShipmentEmbed: React.FC<TrackShipmentEmbedProps> = ({ submittedContainer }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [widgetUrl, setWidgetUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (submittedContainer) {
      fetchTrackingWidget(submittedContainer)
    }
  }, [submittedContainer])

  const fetchTrackingWidget = async (containerNumber: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/searates-widget?container=${encodeURIComponent(containerNumber)}`)
      const data = await response.json()

      if (data.success && data.widgetUrl) {
        setWidgetUrl(data.widgetUrl)
        if (iframeRef.current) {
          iframeRef.current.src = data.widgetUrl
        }
      } else {
        console.error("Error fetching SeaRates widget URL:", data.error)
      }
    } catch (error) {
      console.error("Error in fetchTrackingWidget:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading tracking widget...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="SeaRates Container Tracking"
        width="100%"
        height="500px"
        frameBorder="0"
        allowFullScreen
        className="block"
        style={{ display: loading ? "none" : "block" }}
      ></iframe>
      {!submittedContainer && !loading && (
        <div className="p-4 text-center text-gray-500">
          Enter a container number to see the SeaRates tracking embed.
        </div>
      )}
    </div>
  )
}

export default TrackShipmentEmbed
