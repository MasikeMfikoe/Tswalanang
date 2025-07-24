"use client"

import { Button } from "@/components/ui/button"

import { useRef, useEffect, useCallback, useState } from "react"

interface SignaturePadProps {
  width?: number
  height?: number
  onSave?: (dataUrl: string | null) => void
}

export function SignaturePad({ width = 300, height = 120, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(null)

    if (onSave) {
      onSave(null)
    }
  }, [onSave])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let drawing = false

    const start = (e: MouseEvent | TouchEvent) => {
      drawing = true
      ctx.beginPath()
      ctx.moveTo(getX(e), getY(e))
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return
      ctx.lineTo(getX(e), getY(e))
      ctx.strokeStyle = "black"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.stroke()
    }

    const end = () => {
      drawing = false
      const dataUrl = canvas.toDataURL()
      setSignatureDataUrl(dataUrl)
      if (onSave) {
        onSave(dataUrl)
      }
    }

    const getX = (e: any) => (e.touches ? e.touches[0].clientX : e.clientX) - canvas.getBoundingClientRect().left
    const getY = (e: any) => (e.touches ? e.touches[0].clientY : e.clientY) - canvas.getBoundingClientRect().top

    canvas.addEventListener("mousedown", start)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", end)
    canvas.addEventListener("mouseleave", end)
    canvas.addEventListener("touchstart", start)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", end)

    return () => {
      canvas.removeEventListener("mousedown", start)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", end)
      canvas.removeEventListener("mouseleave", end)
      canvas.removeEventListener("touchstart", start)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", end)
    }
  }, [height, onSave, width])

  return (
    <div className="flex flex-col">
      <canvas ref={canvasRef} width={width} height={height} className="border rounded-md bg-white" />
      <Button type="button" variant="ghost" onClick={clear}>
        Clear
      </Button>
    </div>
  )
}
