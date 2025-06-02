export function checkAPICredentials() {
  const credentials = {
    maersk: {
      available: !!(process.env.MAERSK_CLIENT_ID && process.env.MAERSK_CLIENT_SECRET && process.env.MAERSK_API_URL),
      clientId: process.env.MAERSK_CLIENT_ID,
      baseUrl: process.env.MAERSK_API_URL,
    },
    msc: {
      available: !!(process.env.MSC_USERNAME && process.env.MSC_PASSWORD && process.env.MSC_API_URL),
      username: process.env.MSC_USERNAME,
      baseUrl: process.env.MSC_API_URL,
    },
  }

  return credentials
}

export function getAvailableCarriers() {
  const creds = checkAPICredentials()
  const available = []

  if (creds.maersk.available) available.push("Maersk")
  if (creds.msc.available) available.push("MSC")

  return available
}
