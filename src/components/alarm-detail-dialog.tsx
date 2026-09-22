import { Camera, CheckCheck, Clock, Gauge, MapPin, Search, ShieldX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { branchById } from '@/data/branches'
import { moduleByKey } from '@/data/modules'
import { formatDateTime, formatPercent } from '@/lib/format'
import { useNotifications } from '@/lib/notifications'
import { SeverityBadge, StatusBadge } from './severity-badge'
import { SmartImage } from './smart-image'

/** Tüm uygulamada tek örnek: bir bildirime tıklanınca görselli detay açılır */
export function AlarmDetailDialog() {
  const { selected: alarm, closeAlarm, setStatus } = useNotifications()
  const mod = alarm ? moduleByKey(alarm.module) : null

  const act = (status: 'inceleniyor' | 'kapandi' | 'yanlis', msg: string) => {
    if (!alarm) return
    setStatus(alarm.id, status)
    toast.success(msg, { description: `${alarm.id} · ${alarm.type}` })
    if (status !== 'inceleniyor') closeAlarm()
  }

  return (
    <Dialog open={!!alarm} onOpenChange={(o) => !o && closeAlarm()}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        {alarm && mod && (
          <div className="flex min-w-0 flex-col">
            <div className="relative aspect-[4/3] max-h-[55svh] w-full shrink-0 overflow-hidden rounded-t-xl bg-black">
              <SmartImage src={alarm.image} alt={alarm.title} fit="contain" loading="eager" className="size-full" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" /> KAYIT
                </span>
              </div>
              {alarm.referenceImage && (
                <div className="absolute right-2 bottom-2 w-20 overflow-hidden rounded-lg border-2 border-white/80 bg-black shadow-xl sm:right-3 sm:bottom-3 sm:w-28">
                  <SmartImage src={alarm.referenceImage} alt="Kara liste referans fotoğrafı" hint={false} loading="eager" className="aspect-square w-full" />
                  <div className="bg-red-600 px-1 py-0.5 text-center text-[9px] font-semibold text-white sm:text-[10px]">
                    KARA LİSTE
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <DialogHeader className="gap-2 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={alarm.severity} />
                  <StatusBadge status={alarm.status} />
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <mod.icon className="size-3.5" style={{ color: mod.color }} />
                    Modül {mod.no} · {mod.title}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{alarm.id}</span>
                </div>
                <DialogTitle className="text-lg leading-snug sm:text-xl">{alarm.title}</DialogTitle>
                <DialogDescription>{alarm.description}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: MapPin, label: 'Şube', value: branchById(alarm.branchId)?.name },
                  { icon: Camera, label: 'Kamera', value: alarm.camera.split(' · ')[1] ?? alarm.camera },
                  { icon: Clock, label: 'Zaman', value: formatDateTime(alarm.time) },
                  { icon: Gauge, label: 'Model Güveni', value: formatPercent(alarm.confidence * 100) },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border bg-muted/30 p-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <m.icon className="size-3.5" /> {m.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium">{m.value}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => act('yanlis', 'Yanlış alarm olarak işaretlendi')}>
                  <ShieldX /> Yanlış Alarm
                </Button>
                <Button variant="outline" onClick={() => act('inceleniyor', 'İnceleme başlatıldı')} disabled={alarm.status === 'inceleniyor'}>
                  <Search /> İncelemeye Al
                </Button>
                <Button onClick={() => act('kapandi', 'Alarm kapatıldı')}>
                  <CheckCheck /> Müdahale Edildi · Kapat
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
