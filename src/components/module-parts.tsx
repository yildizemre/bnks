import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { moduleByKey, type ModuleKey } from '@/data/modules'
import { useNotifications } from '@/lib/notifications'
import { AlarmCard } from './alarm-items'
import { SmartImage } from './smart-image'

/** Modül sayfalarının üst banner'ı — kapak görseli `public/images/modules/<modül>.jpg` */
export function ModuleHero({ moduleKey, children }: { moduleKey: ModuleKey; children?: React.ReactNode }) {
  const m = moduleByKey(moduleKey)
  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl sm:mb-6 border bg-[oklch(0.16_0.02_270)] text-white">
      <SmartImage src={m.cover} alt={m.title} hint={false} className="absolute inset-0 size-full opacity-50" fallbackClassName="opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.03_270/0.95)] via-[oklch(0.14_0.03_270/0.75)] to-transparent" />
      <div className="absolute -bottom-24 -left-10 size-72 rounded-full blur-3xl" style={{ background: `color-mix(in oklch, ${m.color} 35%, transparent)` }} />
      <div className="relative flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-end md:justify-between md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur" style={{ color: m.color }}>
              <m.icon className="size-5" />
            </span>
            <Badge variant="outline" className="border-white/20 bg-white/10 font-mono text-white">
              MODÜL {m.no}
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Aktif
            </Badge>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{m.title}</h2>
          <p className="mt-1 text-sm text-white/60">{m.subtitle}</p>
          <p className="mt-3 line-clamp-3 text-sm text-white/80 md:text-base">{m.description}</p>
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  )
}

/** Modüle ait son olaylar — görselli kart ızgarası */
export function ModuleAlarms({ moduleKey, limit = 6, title = 'Son Olaylar' }: { moduleKey: ModuleKey; limit?: number; title?: string }) {
  const { alarms } = useNotifications()
  const list = alarms.filter((a) => a.module === moduleKey).slice(0, limit)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Olay anındaki kamera kareleri · detay için tıklayın</CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to={`/alarmlar?modul=${moduleKey}`}>
              Tümü <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((a) => (
              <AlarmCard key={a.id} alarm={a} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Seçili kapsamda bu modüle ait olay yok.</p>
        )}
      </CardContent>
    </Card>
  )
}
