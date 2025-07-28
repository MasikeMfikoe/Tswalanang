export interface RateItem {
  id: string
  name: string
  seaFreight: number
  airFreight: number
  isPercentage: boolean
  percentageBase?: string // e.g., "totalDisbursements"
}

export interface FreightType {
  id: string
  name: string
}
