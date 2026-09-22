const rtf = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' })

export const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)

export const formatInt = (n: number) => formatNumber(Math.round(n))

export const formatPercent = (n: number, digits = 1) => `%${formatNumber(n, digits)}`

/** saniye -> "6 dk 42 sn" */
export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  if (m === 0) return `${s} sn`
  return s ? `${m} dk ${s} sn` : `${m} dk`
}

export function timeAgo(date: Date) {
  const diff = (date.getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 45) return 'az önce'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export const formatClock = (date: Date) =>
  date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

export const formatDateTime = (date: Date) =>
  date.toLocaleString('tr-TR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const formatLongDate = (date: Date) =>
  date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Deterministik sahte rastgele üretici — mock veriler her yüklemede aynı kalsın */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
