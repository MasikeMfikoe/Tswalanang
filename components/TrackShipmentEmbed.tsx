"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface TrackShipmentEmbedProps {
  submittedContainer: string
}

const TrackShipmentEmbed: React.FC<TrackShipmentEmbedProps> = ({ submittedContainer }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [widgetUrl, setWidgetUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (submittedContainer) {
      setLoading(true)
      setError('')
      
      // Fetch the widget URL from our secure API route
      fetch(`/api/searates-widget?container=${encodeURIComponent(submittedContainer)}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setError(data.error)
          } else {
            setWidgetUrl(data.widgetUrl)
          }
        })
        .catch(err => {
          console.error('Error fetching widget URL:', err)
          setError('Failed to load tracking widget')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setWidgetUrl('')
      setError('')
    }
  }, [submittedContainer])

  useEffect(() => {
    if (iframeRef.current && widgetUrl) {
      iframeRef.current.src = widgetUrl
    }
  }, [widgetUrl])

  if (loading) {
    return (
      <div className="w-full h-[500px] overflow-hidden rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          Loading tracking information...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[500px] overflow-hidden rounded-lg border border-red-200 shadow-sm flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-2">Error loading tracking widget</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {widgetUrl ? (
        <iframe
          ref={iframeRef}
          title="SeaRates Container Tracking"
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
          className="block"
        />
      ) : (
        <div className="p-4 text-center text-gray-500 h-[500px] flex items-center justify-center">
          Enter a container number to see the SeaRates tracking embed.
        </div>
      )}
    </div>
  )
}

export default TrackShipmentEmbed
