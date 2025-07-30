import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { RateItem, FreightType } from "@/types/rates"

// Fetch real rate data from customer_rate_cards table
export const fetchCustomerRates = async (customerId?: string) => {
  const supabase = createClientComponentClient()

  try {
    let query = supabase.from("customer_rate_cards").select("*")

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    const { data: rates, error } = await query

    if (error) {
      console.error("Error fetching customer rates:", error)
      return getDefaultRates()
    }

    if (!rates || rates.length === 0) {
      return getDefaultRates()
    }

    // Transform database rates to RateItem format
    const transformedRates: RateItem[] = rates.map((rate) => ({
      id: rate.id,
      name: rate.service_name || rate.name,
      seaFreight: rate.sea_freight_rate || 0,
      airFreight: rate.air_freight_rate || 0,
      isPercentage: rate.is_percentage || false,
      percentageBase: rate.percentage_base || "totalDisbursements",
    }))

    return transformedRates
  } catch (error) {
    console.error("Error in fetchCustomerRates:", error)
    return getDefaultRates()
  }
}

// Fetch freight types from database
export const fetchFreightTypes = async () => {
  const supabase = createClientComponentClient()

  try {
    const { data: freightTypes, error } = await supabase.from("freight_types").select("*").eq("is_active", true)

    if (error) {
      console.error("Error fetching freight types:", error)
      return getDefaultFreightTypes()
    }

    if (!freightTypes || freightTypes.length === 0) {
      return getDefaultFreightTypes()
    }

    // Transform database freight types
    const transformedTypes: FreightType[] = freightTypes.map((type) => ({
      id: type.id,
      name: type.name,
    }))

    return transformedTypes
  } catch (error) {
    console.error("Error in fetchFreightTypes:", error)
    return getDefaultFreightTypes()
  }
}

// Default rates as fallback
export const getDefaultRates = (): RateItem[] => [
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

export const getDefaultFreightTypes = (): FreightType[] => [
  {
    id: "sea",
    name: "Sea Freight",
  },
  {
    id: "air",
    name: "Air Freight",
  },
]

// For backward compatibility
export const defaultRates = getDefaultRates()
export const defaultFreightTypes = getDefaultFreightTypes()
