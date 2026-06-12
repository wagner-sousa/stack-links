export function formatTime(str) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const h = now.getHours()
  return str
    .replace(/HH/g, pad(h))
    .replace(/hh/g, pad(h % 12 || 12))
    .replace(/mm/g, pad(now.getMinutes()))
    .replace(/ss/g, pad(now.getSeconds()))
    .replace(/A/g, h < 12 ? "AM" : "PM")
    .replace(/a/g, h < 12 ? "am" : "pm")
}

export function formatDate(str) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return str
    .replace(/YYYY/g, now.getFullYear())
    .replace(/YY/g, String(now.getFullYear()).slice(-2))
    .replace(/MMMM/g, now.toLocaleDateString("en", { month: "long" }))
    .replace(/MMM/g, now.toLocaleDateString("en", { month: "short" }))
    .replace(/MM/g, pad(now.getMonth() + 1))
    .replace(/DD/g, pad(now.getDate()))
    .replace(/dddd/g, now.toLocaleDateString("en", { weekday: "long" }))
}
