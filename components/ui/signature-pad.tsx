"use client"

import { useRef, useEffect } from "react"

export default function SignaturePad({ width = 300, height = 120 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const end = () => (drawing = false)

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
  }, [])

  return <canvas ref={canvasRef} width={width} height={height} className="border rounded-md bg-white" />
}
