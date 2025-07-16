"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface TrackShipmentEmbedProps {
  submittedContainer: string
}

const TrackShipmentEmbed: React.FC<TrackShipmentEmbedProps> = ({ submittedContainer }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current && submittedContainer) {
      // Construct the URL for the SeaRates tracking widget
      // Replace 'YOUR_SEARATES_API_KEY' with your actual SeaRates API key
      // The 'number' parameter should be the tracking number
      // The 'width' and 'height' can be adjusted as needed
      const searatesWidgetUrl = `https://www.searates.com/container-tracking/widget/?number=${submittedContainer}&width=100%&height=500px&api_key=${process.env.NEXT_PUBLIC_SEARATES_API_KEY}`

      iframeRef.current.src = searatesWidgetUrl
    }
  }, [submittedContainer])

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <iframe
        ref={iframeRef}
        title="SeaRates Container Tracking"
        width="100%"
        height="500px"
        frameBorder="0"
        allowFullScreen
        className="block"
      ></iframe>
      {!submittedContainer && (
        <div className="p-4 text-center text-gray-500">
          Enter a container number to see the SeaRates tracking embed.
        </div>
      )}
    </div>
  )
}

export default TrackShipmentEmbed
