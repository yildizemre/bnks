import { Camera, MapPin } from 'lucide-react'
import type { Alarm } from '@/data/alarms'
import { branchById } from '@/data/branches'
import { moduleByKey } from '@/data/modules'
import { timeAgo } from '@/lib/format'
import { useNotifications } from '@/lib/notifications'
import { severityMeta } from '@/lib/severity'
import { cn } from '@/lib/utils'
import { SeverityBadge, StatusBadge } from './severity-badge'
import { SmartImage } from './smart-image'

/** Satır görünümü: küçük görsel + başlık + meta */
export function AlarmListItem({ alarm, compact }: { alarm: Alarm; compact?: boolean }) {
  const { openAlarm } = useNotifications()
  const mod = moduleByKey(alarm.module)
  return (
    <button
      type="button"
      onClick={() => openAlarm(alarm.id)}
      className={cn(
        'group flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left transition hover:bg-muted/60',
        !alarm.read && 'bg-primary/5',
      )}
    >
      <div className={cn('relative shrink-0 overflow-hidden rounded-md border', compact ? 'h-12 w-16' : 'h-14 w-20')}>
        <SmartImage src={alarm.image} alt={alarm.title} hint={false} className="size-full transition group-hover:scale-105" />
        <span className={cn('absolute top-1 left-1 size-2 rounded-full ring-2 ring-black/30', severityMeta[alarm.severity].dot)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <mod.icon className="size-3.5 shrink-0" style={{ color: mod.color }} />
          <span className="truncate">{alarm.type}</span>
          <span className="ml-auto shrink-0 tabular-nums">{timeAgo(alarm.time)}</span>
        </div>
        <p className={cn('mt-0.5 truncate text-sm', !alarm.read && 'font-semibold')}>{alarm.title}</p>
        {!compact && (
          <p className="truncate text-xs text-muted-foreground">
            {branchById(alarm.branchId)?.name} · {alarm.camera}
          </p>
        )}
      </div>
      {!alarm.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
    </button>
  )
}

/** Kart görünümü: büyük görsel + rozetler */
export function AlarmCard({ alarm }: { alarm: Alarm }) {
  const { openAlarm } = useNotifications()
  const mod = moduleByKey(alarm.module)
  return (
    <button
      type="button"
      onClick={() => openAlarm(alarm.id)}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden">
        <SmartImage src={alarm.image} alt={alarm.title} className="size-full transition duration-300 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <SeverityBadge severity={alarm.severity} className="bg-background/80 backdrop-blur" />
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">{alarm.id}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 pt-6 text-[11px] text-white/90">
          <span className="inline-flex items-center gap-1">
            <Camera className="size-3" /> {alarm.camera}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <mod.icon className="size-3.5" style={{ color: mod.color }} />
          {alarm.type}
          <span className="ml-auto">{timeAgo(alarm.time)}</span>
        </div>
        <p className="line-clamp-2 text-sm font-medium">{alarm.title}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{branchById(alarm.branchId)?.name}</span>
          </span>
          <StatusBadge status={alarm.status} />
        </div>
      </div>
    </button>
  )
}
