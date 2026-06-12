export function weatherFromCode(code, isDay) {
  if (code === 0) return { icon: isDay ? "sun" : "moon", desc: "Clear" }
  if (code <= 3) return { icon: isDay ? "cloud-sun" : "cloud-moon", desc: "Partly cloudy" }
  if (code <= 48) return { icon: "cloud-fog", desc: "Foggy" }
  if (code <= 57) return { icon: "cloud-drizzle", desc: "Drizzle" }
  if (code <= 67) return { icon: "cloud-rain", desc: "Rain" }
  if (code <= 77) return { icon: "cloud-snow", desc: "Snow" }
  if (code <= 82) return { icon: "cloud-rain", desc: "Rain showers" }
  if (code <= 99) return { icon: "cloud-lightning", desc: "Thunderstorm" }
  return { icon: isDay ? "sun" : "moon", desc: "" }
}

export async function fetchCity(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "StackLinks/1.0" } }
    )
    const data = await res.json()
    return data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || ""
  } catch {
    return ""
  }
}

const CACHE_KEY = "weather_cache_v2"
const CACHE_TTL = 600000

export function getCachedWeather() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_TTL) return data
  } catch {}
  return null
}

export function setCachedWeather(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}
