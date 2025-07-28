"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

// Update the props to include dutyFree status
export default function EstimateGeneration({
  orderId,
  freightType,
  dutyFree = false, // Add default value
}: {
  orderId: string
  freightType: string
  dutyFree?: boolean
}) {
  // Make auth optional by using try-catch
  const { user: authUser } = useAuth()
  const user = authUser

  // Update the initial state to include base rates for different freight types
  const [estimate, setEstimate] = useState({
    commercialValue: 100000, // Default commercial value
    shippingCost: freightType.toLowerCase() === "sea freight" ? 15000 : 18500, // Sea freight is cheaper but slower
    customsDuties: freightType.toLowerCase() === "sea freight" ? 7500 : 9250, // Customs duties are typically lower for sea freight
    customsVAT: 0, // Add this line
    handlingFees: freightType.toLowerCase() === "sea freight" ? 3750 : 4625, // Handling fees are lower for sea freight
    documentationFee: freightType.toLowerCase() === "sea freight" ? 350 : 250, // Documentation is more complex for sea freight
    communicationFee: freightType.toLowerCase() === "sea freight" ? 350 : 150,
    totalDisbursements: 0,
    facilityFee: 0,
    agencyFee: 0,
    subtotal: 0,
    vat: 0,
    total: 0,
  })

  // Update the useEffect for VAT calculation
  useEffect(() => {
    const baseVAT = estimate.commercialValue * 0.15 // 15% of commercial value
    const dutyFreeVAT = dutyFree ? estimate.commercialValue * 0.1 : 0 // Additional 10% if duty free
    const totalCustomsVAT = baseVAT + dutyFreeVAT

    setEstimate((prev) => ({
      ...prev,
      customsVAT: totalCustomsVAT,
    }))
  }, [estimate.commercialValue, dutyFree])

  // Update the useEffect that watches freightType to recalculate all costs
  useEffect(() => {
    setEstimate((prev) => ({
      ...prev,
      shippingCost: freightType.toLowerCase() === "sea freight" ? 15000 : 18500,
      customsDuties: freightType.toLowerCase() === "sea freight" ? 7500 : 9250,
      customsVAT: freightType.toLowerCase() === "sea freight" ? 7500 * 0.15 : 9250 * 0.15, // Add this line
      handlingFees: freightType.toLowerCase() === "sea freight" ? 3750 : 4625,
      documentationFee: freightType.toLowerCase() === "sea freight" ? 350 : 250,
      communicationFee: freightType.toLowerCase() === "sea freight" ? 350 : 150, // Communication fee varies by freight type
    }))
  }, [freightType])

  useEffect(() => {
    const totalDisbursements =
      estimate.shippingCost +
      estimate.customsDuties +
      estimate.customsVAT + // Add this line
      estimate.handlingFees +
      estimate.documentationFee +
      estimate.communicationFee
    const facilityFee = totalDisbursements * 0.025 // 2.5%
    const agencyFee = totalDisbursements * 0.035 // 3.5%

    // Calculate subtotal excluding shipping, customs duties, and customs VAT for VAT
    const vatableAmount =
      estimate.handlingFees + estimate.documentationFee + estimate.communicationFee + facilityFee + agencyFee

    const vat = vatableAmount * 0.15 // 15% VAT only on vatable items
    const subtotal = totalDisbursements + facilityFee + agencyFee
    const total = subtotal + vat

    setEstimate((prev) => ({
      ...prev,
      totalDisbursements,
      facilityFee,
      agencyFee,
      subtotal,
      vat,
      total,
    }))
  }, [
    estimate.shippingCost,
    estimate.customsDuties,
    estimate.customsVAT, // Add this line
    estimate.handlingFees,
    estimate.documentationFee,
    estimate.communicationFee,
  ])

  const handleGenerateEstimate = () => {
    // In a real application, this would call an API to generate the estimate
    console.log("Generating estimate for order", orderId, user ? `by user ${user.username}` : "(unauthenticated)")
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-background z-10 py-2">
        <h2 className="text-xl font-semibold">Estimate Generation</h2>
        <Button onClick={handleGenerateEstimate}>Generate New Estimate</Button>
      </div>
      <Card className="mb-4 max-h-[600px] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b pb-3">
          <CardTitle>Current Estimate</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="mb-4 p-2 bg-muted rounded">
              <p className="font-medium mb-1">Selected Freight Type: {freightType}</p>
              <p className="text-xs text-muted-foreground">
                {freightType.toLowerCase() === "sea freight"
                  ? "Sea freight offers cost-effective rates for bulk shipping with longer transit times"
                  : "Air freight provides faster delivery with premium rates"}
              </p>
            </div>
            <p>
              <strong>Commercial Value:</strong> {formatCurrency(estimate.commercialValue)}
            </p>
            <p>
              <strong>Customs Duties:</strong> {formatCurrency(estimate.customsDuties)}
            </p>
            <p>
              <strong>Customs VAT:</strong> {formatCurrency(estimate.customsVAT)}
              <span className="text-xs text-muted-foreground ml-2">
                (15% of commercial value {dutyFree ? "+ 10% duty free rate" : ""})
              </span>
            </p>
            <p>
              <strong>Handling Fees:</strong> {formatCurrency(estimate.handlingFees)}
            </p>
            <p>
              <strong>Shipping Cost:</strong> {formatCurrency(estimate.shippingCost)}
            </p>
            <p>
              <strong>Documentation Fee ({freightType.toLowerCase() === "sea freight" ? "Sea" : "Air"}):</strong>{" "}
              {formatCurrency(estimate.documentationFee)}
            </p>
            <p>
              <strong>Communication Fee ({freightType.toLowerCase() === "sea freight" ? "Sea" : "Air"}):</strong>{" "}
              {formatCurrency(estimate.communicationFee)}
            </p>
            <div className="border-t pt-2 mt-4">
              <p>
                <strong>Total Disbursements:</strong> {formatCurrency(estimate.totalDisbursements)}
              </p>
              <p>
                <strong>Facility Fee (2.5%):</strong> {formatCurrency(estimate.facilityFee)}
              </p>
              <p>
                <strong>Agency Fee (3.5%):</strong> {formatCurrency(estimate.agencyFee)}
              </p>
            </div>
            <div className="border-t pt-2 mt-4">
              <p>
                <strong>Subtotal:</strong> {formatCurrency(estimate.subtotal)}
              </p>
              <p>
                <strong>VAT (15%):</strong> {formatCurrency(estimate.vat)}
              </p>
              <p className="text-base font-bold mt-2">
                <strong>Total:</strong> {formatCurrency(estimate.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
