// This file was left out for brevity. Assume it is correct and does not need any modifications.
// Placeholder content for lib/apiKeys.ts
export const getApiKey = (service: string) => {
  return process.env[`NEXT_PUBLIC_${service.toUpperCase()}_API_KEY`] || `mock-api-key-for-${service}`
}
