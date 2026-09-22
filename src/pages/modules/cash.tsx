import { BellOff, Banknote, Hourglass, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { KpiCard } from '@/components/kpi-card'
import { ModuleAlarms, ModuleHero } from '@/components/module-parts'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cashDesks, cashEvents } from '@/data/metrics'
import { useScope } from '@/lib/scope'

const config = { olay: { label: 'Açıkta nakit olayı', color: 'var(--chart-3)' } } satisfies ChartConfig

export function CashPage() {
  const { factor } = useScope()
  const events = useMemo(() => cashEvents(factor), [factor])
  const total = events.reduce((s, e) => s + e.olay, 0)

  return (
    <>
      <ModuleHero moduleKey="cash" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Açıkta Nakit Olayı (Hafta)" value={String(total)} icon={Banknote} delta={-22} higherIsBetter={false} trend={events.map((e) => e.olay)} color="var(--chart-3)" />
        <KpiCard label="Sessiz Alarm Eşiği" value="60" unit="sn" icon={BellOff} hint="sahipsiz kalma süresi" color="var(--chart-1)" />
        <KpiCard label="En Uzun Sahipsiz Süre" value="2:18" unit="dk" icon={Hourglass} hint="Banko 2 · bugün 14:05" color="var(--chart-4)" />
        <KpiCard label="İhlalsiz Gün Serisi" value="0" unit="gün" icon={ShieldCheck} hint="rekor: 9 gün" color="var(--chart-5)" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Günlük Olay Sayısı</CardTitle>
            <CardDescription>Bu hafta · banko üzerinde sahipsiz nakit</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
              <BarChart data={events} margin={{ left: -24 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="olay" fill="var(--color-olay)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Banko Durumu</CardTitle>
            <CardDescription>Her banko için canlı kamera görünümü ve günlük özet</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {cashDesks.map((d) => (
              <div key={d.id} className="overflow-hidden rounded-xl border">
                <div className="relative aspect-[4/3]">
                  <SmartImage src={d.image} alt={d.name} className="size-full" />
                  <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">{d.camera}</span>
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    {d.exposedToday > 2 ? (
                      <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        Dikkat
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Normal
                      </Badge>
                    )}
                  </div>
                  <dl className="grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <dt className="text-muted-foreground">Olay</dt>
                      <dd className="font-semibold tabular-nums">{d.exposedToday}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Maks.</dt>
                      <dd className="font-semibold tabular-nums">{d.maxSeconds} sn</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Son</dt>
                      <dd className="font-semibold tabular-nums">{d.lastEvent}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <ModuleAlarms moduleKey="cash" title="Sessiz Alarmlar" />
      </div>
    </>
  )
}
