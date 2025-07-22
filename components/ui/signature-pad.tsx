"use client"

import { useRef, useState, type PointerEvent } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignaturePadProps {
  /** Called with a base64-PNG each time the user lifts the pointer */
  onSave?: (dataUrl: string) => void
  className?: string
  height?: number
  width?: number
}

export function SignaturePad({ onSave, className, height = 200, width = 500 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState(false)

  const getCtx = () => canvasRef.current?.getContext("2d")

  const start = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx()
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "black"
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setDrawing(true)
  }

  const draw = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const ctx = getCtx()
    if (!ctx) return
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  const end = () => {
    if (!drawing) return
    setDrawing(false)
    const dataUrl = canvasRef.current?.toDataURL("image/png")
    if (dataUrl && onSave) onSave(dataUrl)
  }

  const clear = () => {
    const ctx = getCtx()
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    onSave?.("") // reset signature
  }

  return (
    <div className={cn("space-y-2", className)}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 touch-none"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <Button type="button" variant="outline" size="sm" onClick={clear}>
        Clear
      </Button>
    </div>
  )
}
