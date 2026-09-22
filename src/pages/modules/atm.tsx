import { BedDouble, Hammer, Landmark, PackageSearch } from 'lucide-react'
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts'
import { KpiCard } from '@/components/kpi-card'
import { ModuleAlarms, ModuleHero } from '@/components/module-parts'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { atmThreatMix, atmUnits } from '@/data/metrics'
import { useScope } from '@/lib/scope'
import { cn } from '@/lib/utils'

const threatColors: Record<string, string> = { paket: 'var(--chart-3)', arac: 'var(--chart-4)', barinma: 'var(--chart-2)' }
const config = {
  value: { label: 'Olay' },
  paket: { label: 'Sahipsiz Paket', color: threatColors.paket },
  arac: { label: 'Saldırı Aracı', color: threatColors.arac },
  barinma: { label: 'Barınma / Uyuma', color: threatColors.barinma },
} satisfies ChartConfig

const statusStyle = {
  normal: { label: 'Normal', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', ring: '' },
  uyari: { label: 'Uyarı', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300', ring: 'ring-amber-500/40' },
  alarm: { label: 'Alarm', cls: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400', ring: 'ring-red-500/50' },
}

export function AtmPage() {
  const { scopeIds } = useScope()
  const units = atmUnits.filter((u) => scopeIds.includes(u.branchId))

  return (
    <>
      <ModuleHero moduleKey="atm" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="İzlenen ATM" value={String(units.length)} icon={Landmark} hint={`${units.filter((u) => u.status !== 'normal').length} tanesi dikkat gerektiriyor`} color="var(--chart-5)" />
        <KpiCard label="Sahipsiz Paket (30g)" value="7" icon={PackageSearch} delta={-12} higherIsBetter={false} color="var(--chart-3)" />
        <KpiCard label="Saldırı Aracı Tespiti (30g)" value="3" icon={Hammer} delta={50} higherIsBetter={false} hint="levye, matkap, sprey boya" color="var(--chart-4)" />
        <KpiCard label="Barınma / Uyuma (30g)" value="12" icon={BedDouble} delta={-8} higherIsBetter={false} hint="çoğunlukla 00:00–06:00" color="var(--chart-2)" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tehdit Türleri</CardTitle>
            <CardDescription>Son 30 gün</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
              <BarChart data={atmThreatMix} layout="vertical" margin={{ left: 8, right: 16 }}>
                <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={110} />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={6}>
                  {atmThreatMix.map((t) => (
                    <Cell key={t.key} fill={threatColors[t.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ATM Kabinleri</CardTitle>
            <CardDescription>Canlı görünüm ve son olay</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {units.map((u) => {
              const s = statusStyle[u.status]
              return (
                <div key={u.id} className={cn('overflow-hidden rounded-xl border', s.ring && `ring-2 ${s.ring}`)}>
                  <div className="relative aspect-video">
                    <SmartImage src={u.image} alt={u.id} className="size-full" />
                    <Badge variant="outline" className={cn('absolute top-2 right-2 backdrop-blur', s.cls)}>
                      {s.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold">{u.id}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.location}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold tabular-nums">{u.events} olay</p>
                      <p className="text-muted-foreground">{u.lastEvent}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            {!units.length && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Seçili kapsamda ATM yok.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <ModuleAlarms moduleKey="atm" title="ATM ve Nesne Olayları" />
      </div>
    </>
  )
}
