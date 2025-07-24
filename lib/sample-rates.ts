import type { RateItem, FreightType } from "@/types/rates"

export const defaultRates: RateItem[] = [
  {
    id: "communication",
    name: "Communication Fee",
    seaFreight: 350,
    airFreight: 150,
    isPercentage: false,
  },
  {
    id: "documentation",
    name: "Documentation Fee",
    seaFreight: 350,
    airFreight: 250,
    isPercentage: false,
  },
  {
    id: "agency",
    name: "Agency Fee",
    seaFreight: 3.5,
    airFreight: 3.5,
    isPercentage: true,
    percentageBase: "totalDisbursements",
  },
  {
    id: "facility",
    name: "Facility Fee",
    seaFreight: 2.5,
    airFreight: 2.5,
    isPercentage: true,
    percentageBase: "totalDisbursements",
  },
]

export const defaultFreightTypes: FreightType[] = [
  {
    id: "sea",
    name: "Sea Freight",
  },
  {
    id: "air",
    name: "Air Freight",
  },
]

export const sampleRates = []
