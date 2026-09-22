import type { AlarmStatus, Severity } from '@/data/alarms'
import { Badge } from '@/components/ui/badge'
import { severityMeta, statusMeta } from '@/lib/severity'
import { cn } from '@/lib/utils'

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const m = severityMeta[severity]
  return (
    <Badge variant="outline" className={cn('gap-1.5', m.badge, className)}>
      <span className={cn('size-1.5 rounded-full', m.dot, severity === 'kritik' && 'animate-pulse')} />
      {m.label}
    </Badge>
  )
}

export function StatusBadge({ status, className }: { status: AlarmStatus; className?: string }) {
  const m = statusMeta[status]
  return (
    <Badge variant="outline" className={cn(m.badge, className)}>
      {m.label}
    </Badge>
  )
}
