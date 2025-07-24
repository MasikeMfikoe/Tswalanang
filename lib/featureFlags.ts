// Simple feature flag system
type FeatureFlag = {
  enabled: boolean
  description: string
}

type FeatureFlags = {
  [key: string]: FeatureFlag
}

// Define your feature flags
const FLAGS: FeatureFlags = {
  NEW_ORDER_DETAILS_UI: {
    enabled: false,
    description: "New UI for order details page",
  },
  COURIER_ORDERS_ENABLED: {
    enabled: true,
    description: "Enable courier orders functionality",
  },
  NEW_DOCUMENT_UPLOAD: {
    enabled: false,
    description: "New document upload experience",
  },
}

// Get a feature flag value
export function isFeatureEnabled(flagName: string): boolean {
  // Check if the flag exists
  if (!(flagName in FLAGS)) {
    console.warn(`Feature flag "${flagName}" does not exist`)
    return false
  }

  // Return the flag value
  return FLAGS[flagName].enabled
}

// For development/testing, allow overriding flags
export function enableFeature(flagName: string): void {
  if (process.env.NODE_ENV !== "production") {
    if (flagName in FLAGS) {
      FLAGS[flagName].enabled = true
    }
  }
}

export function disableFeature(flagName: string): void {
  if (process.env.NODE_ENV !== "production") {
    if (flagName in FLAGS) {
      FLAGS[flagName].enabled = false
    }
  }
}

// Placeholder content for lib/featureFlags.ts
export const featureFlags = {
  isFeatureEnabled: (flag: string) => true,
}
