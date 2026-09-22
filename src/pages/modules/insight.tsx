import { useMemo } from 'react'
import { CalendarClock, UserRoundCheck, UsersRound, Venus } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { KpiCard } from '@/components/kpi-card'
import { ModuleHero } from '@/components/module-parts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { ageDistribution, hourlyTraffic, weeklyVisitors } from '@/data/metrics'
import { formatInt, formatPercent } from '@/lib/format'
import { useScope } from '@/lib/scope'

const weekConfig = {
  buHafta: { label: 'Bu hafta', color: 'var(--chart-2)' },
  gecenHafta: { label: 'Geçen hafta', color: 'var(--muted-foreground)' },
} satisfies ChartConfig

const ageConfig = {
  kadin: { label: 'Kadın', color: 'var(--chart-1)' },
  erkek: { label: 'Erkek', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function InsightPage() {
  const { factor } = useScope()
  const week = useMemo(() => weeklyVisitors(factor), [factor])
  const ages = useMemo(() => ageDistribution(factor), [factor])
  const hours = useMemo(() => hourlyTraffic(factor), [factor])

  const today = week[4].buHafta
  const staff = hours.reduce((s, h) => s + h.personel, 0)
  const women = ages.reduce((s, a) => s + a.kadin, 0)
  const men = ages.reduce((s, a) => s + a.erkek, 0)
  const womenPct = (women / (women + men)) * 100
  const peak = hours.reduce((a, b) => (b.musteri > a.musteri ? b : a))
  const gender = [
    { key: 'kadin', value: women, fill: 'var(--chart-1)' },
    { key: 'erkek', value: men, fill: 'var(--chart-2)' },
  ]

  return (
    <>
      <ModuleHero moduleKey="insight" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Net Müşteri (Bugün)" value={formatInt(today)} icon={UsersRound} delta={7.9} hint="geçen Cuma'ya göre" trend={week.map((w) => w.buHafta)} color="var(--chart-2)" />
        <KpiCard label="Ayrıştırılan Personel Geçişi" value={formatInt(staff)} icon={UserRoundCheck} hint="sayıma dahil edilmedi" color="var(--chart-1)" />
        <KpiCard label="En Yoğun Saat" value={peak.hour} icon={CalendarClock} hint={`${formatInt(peak.musteri)} müşteri`} color="var(--chart-3)" />
        <KpiCard label="Kadın / Erkek" value={`${formatPercent(womenPct, 0)} / ${formatPercent(100 - womenPct, 0)}`} icon={Venus} hint="demografik tahmin" color="var(--chart-4)" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Haftalık Net Ziyaretçi</CardTitle>
            <CardDescription>Bu hafta ile geçen haftanın karşılaştırması</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weekConfig} className="aspect-auto h-[280px] w-full">
              <BarChart data={week} margin={{ left: -16 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="gecenHafta" fill="var(--color-gecenHafta)" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                <Bar dataKey="buHafta" fill="var(--color-buHafta)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cinsiyet Dağılımı</CardTitle>
            <CardDescription>Bugün · yapay zekâ tahmini</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ageConfig} className="mx-auto aspect-square h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie data={gender} dataKey="value" nameKey="key" innerRadius={60} outerRadius={95} strokeWidth={3} stroke="var(--card)">
                  {gender.map((g) => (
                    <Cell key={g.key} fill={g.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Kadın</p>
                <p className="text-lg font-semibold tabular-nums">{formatInt(women)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Erkek</p>
                <p className="text-lg font-semibold tabular-nums">{formatInt(men)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Yaş Aralığı Dağılımı</CardTitle>
          <CardDescription>Cinsiyete göre kırılım</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ageConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={ages} margin={{ left: -16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="kadin" stackId="a" fill="var(--color-kadin)" />
              <Bar dataKey="erkek" stackId="a" fill="var(--color-erkek)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

    </>
  )
}
