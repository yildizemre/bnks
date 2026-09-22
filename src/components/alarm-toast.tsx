import { toast } from 'sonner'
import type { Alarm } from '@/data/alarms'
import { branchById } from '@/data/branches'
import { moduleByKey } from '@/data/modules'
import { severityMeta } from '@/lib/severity'
import { cn } from '@/lib/utils'
import { SmartImage } from './smart-image'

/** Canlı alarm düştüğünde görselli pop-up bildirim */
export function showAlarmToast(alarm: Alarm, onOpen: () => void) {
  const mod = moduleByKey(alarm.module)
  const sev = severityMeta[alarm.severity]
  toast.custom(
    (id) => (
      <button
        type="button"
        onClick={() => {
          onOpen()
          toast.dismiss(id)
        }}
        className="flex w-[min(356px,calc(100vw-2rem))] items-stretch gap-3 overflow-hidden rounded-xl border bg-popover p-2 text-left text-popover-foreground shadow-lg transition hover:border-primary/50"
      >
        <div className="relative w-24 shrink-0 overflow-hidden rounded-lg">
          <SmartImage src={alarm.image} alt={alarm.title} hint={false} loading="eager" className="size-full" />
          <span className={cn('absolute top-1.5 left-1.5 size-2 rounded-full ring-2 ring-black/30', sev.dot, 'animate-pulse')} />
        </div>
        <div className="min-w-0 flex-1 py-1 pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <mod.icon className="size-3.5" />
            <span className="truncate">{alarm.type}</span>
            <span className="ml-auto shrink-0">{sev.label}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-snug font-medium">{alarm.title}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {branchById(alarm.branchId)?.name} · {alarm.camera}
          </p>
        </div>
      </button>
    ),
    { duration: alarm.severity === 'kritik' ? 12_000 : 7_000 },
  )
}
