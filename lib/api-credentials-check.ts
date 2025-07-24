export function checkAPICredentials(serviceName: string) {
  const apiKey = process.env[`${serviceName.toUpperCase()}_API_KEY`]
  return !!apiKey
}

export function getAvailableCarriers() {
  const availableCarriers = []

  if (checkAPICredentials("maersk")) availableCarriers.push("Maersk")
  if (checkAPICredentials("msc")) availableCarriers.push("MSC")

  return availableCarriers
}
