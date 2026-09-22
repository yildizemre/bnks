import type { AlarmStatus, Severity } from '@/data/alarms'

export const severityMeta: Record<Severity, { label: string; badge: string; dot: string; rank: number }> = {
  kritik: { label: 'Kritik', badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', dot: 'bg-red-500', rank: 0 },
  yuksek: { label: 'Yüksek', badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30', dot: 'bg-orange-500', rank: 1 },
  orta: { label: 'Orta', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500', rank: 2 },
  dusuk: { label: 'Düşük', badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', dot: 'bg-sky-500', rank: 3 },
}

export const statusMeta: Record<AlarmStatus, { label: string; badge: string }> = {
  yeni: { label: 'Yeni', badge: 'bg-primary/15 text-primary border-primary/30' },
  inceleniyor: { label: 'İnceleniyor', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  kapandi: { label: 'Kapatıldı', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  yanlis: { label: 'Yanlış Alarm', badge: 'bg-muted text-muted-foreground border-border' },
}
