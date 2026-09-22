import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  /** Önceki döneme göre yüzde değişim */
  delta?: number
  /** Artış iyi mi? (ör. bekleme süresinde düşüş iyidir) */
  higherIsBetter?: boolean
  hint?: string
  trend?: number[]
  color?: string
  className?: string
}

export function KpiCard({ label, value, unit, icon: Icon, delta, higherIsBetter = true, hint, trend, color = 'var(--chart-1)', className }: KpiCardProps) {
  const good = delta === undefined ? undefined : delta === 0 ? undefined : delta > 0 === higherIsBetter
  const gradientId = `kpi-${label.replace(/\W/g, '')}`
  return (
    <Card className={cn('group relative gap-0 overflow-hidden py-0 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: `color-mix(in oklch, ${color} 45%, transparent)` }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <p className="text-xs leading-snug font-medium text-muted-foreground sm:text-sm">{label}</p>
          <span className="flex size-8 shrink-0 items-center sm:size-9 justify-center rounded-xl border border-white/5" style={{ color, background: `color-mix(in oklch, ${color} 14%, transparent)` }}>
            <Icon className="size-4 sm:size-4.5" />
          </span>
        </div>
        <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5 sm:mt-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
          {unit && <span className="truncate text-xs text-muted-foreground sm:text-sm">{unit}</span>}
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] sm:text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium',
                good === undefined && 'bg-muted text-muted-foreground',
                good === true && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                good === false && 'bg-red-500/15 text-red-600 dark:text-red-400',
              )}
            >
              {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}%{Math.abs(delta).toLocaleString('tr-TR')}
            </span>
          )}
          {hint && <span className="hidden truncate text-muted-foreground min-[420px]:inline">{hint}</span>}
        </div>
      </CardContent>
      {trend && (
        <div className="pointer-events-none -mt-3 h-14 w-full">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 56 }}>
            <AreaChart data={trend.map((v, i) => ({ i, v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
