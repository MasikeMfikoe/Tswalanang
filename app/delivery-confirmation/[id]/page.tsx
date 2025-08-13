"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function DeliveryConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token: string }> // Updated to Promise type for Next.js 15 compatibility
}) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ token: string } | null>(null) // Added state for resolved searchParams
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const signatureRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    const resolveSearchParams = async () => {
      const resolved = await searchParams
      setResolvedSearchParams(resolved)
    }
    resolveSearchParams()
  }, [searchParams])

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!resolvedParams?.id || !resolvedSearchParams?.token) return

      try {
        setLoading(true)
        // In a real implementation, this would validate the token and fetch order details
        // For now, we'll simulate a successful response
        setOrderDetails({
          id: resolvedParams.id,
          waybillNo: `WB-${resolvedParams.id}`,
          sender: "ABC Company",
          receiver: "XYZ Corporation",
          status: "Out for Delivery",
        })
      } catch (err) {
        setError("Failed to load order details. The link may have expired.")
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams && resolvedSearchParams) {
      // Updated condition to check both resolved values
      fetchOrderDetails()
    }
  }, [resolvedParams, resolvedSearchParams]) // Updated dependency to use resolved searchParams

  // Signature pad functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)

    // Get position
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get position
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault() // Prevent scrolling on touch devices
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)

    const canvas = signatureRef.current
    if (!canvas) return

    setSignatureDataUrl(canvas.toDataURL("image/png"))
  }

  const clearSignature = () => {
    const canvas = signatureRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !designation || !signatureDataUrl || !agreeToTerms) {
      setError("Please fill in all fields, sign, and agree to the terms.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would send the data to the server
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/delivery-confirmation/success")
      }, 3000)
    } catch (err) {
      setError("Failed to submit delivery confirmation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!resolvedParams || !resolvedSearchParams) {
    // Updated condition to check both resolved values
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading && !orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error && !orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Delivery Confirmed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Thank you for confirming your delivery. A confirmation email has been sent to you.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Delivery Confirmation</CardTitle>
          <CardDescription>
            Order #{resolvedParams.id} • Waybill: {orderDetails?.waybillNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">From:</p>
                  <p className="text-sm">{orderDetails?.sender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">To:</p>
                  <p className="text-sm">{orderDetails?.receiver}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation / Title</Label>
              <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <div className="border border-gray-300 rounded-md p-2 bg-white">
                <canvas
                  ref={signatureRef}
                  width={450}
                  height={150}
                  className="w-full border border-gray-200 rounded touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={endDrawing}
                />
                <div className="flex justify-end mt-2">
                  <Button type="button" variant="outline" onClick={clearSignature} size="sm">
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I have received this delivery in good condition
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !name || !designation || !signatureDataUrl || !agreeToTerms}
            >
              {loading ? "Submitting..." : "Confirm Delivery"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
