import { useMemo } from 'react'
import { AlarmClock, Clock4, Gauge, Handshake } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { KpiCard } from '@/components/kpi-card'
import { ModuleAlarms, ModuleHero } from '@/components/module-parts'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { counters, waitByHour, WAIT_KPI_MINUTES } from '@/data/metrics'
import { formatDuration, formatNumber } from '@/lib/format'
import { useScope } from '@/lib/scope'
import { cn } from '@/lib/utils'

const waitConfig = {
  bekleme: { label: 'Ort. bekleme (dk)', color: 'var(--chart-1)' },
  hizmet: { label: 'Ort. hizmet (dk)', color: 'var(--chart-5)' },
} satisfies ChartConfig

const statusBadge = {
  aktif: { label: 'Aktif', cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  mola: { label: 'Molada', cls: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  bos: { label: 'Boş', cls: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400' },
}

export function OperationsPage() {
  const { factor } = useScope()
  const wait = useMemo(() => waitByHour(factor), [factor])
  const breaches = wait.filter((w) => w.bekleme > WAIT_KPI_MINUTES).length
  const avgWait = wait.reduce((s, w) => s + w.bekleme, 0) / wait.length
  const avgSla = counters.reduce((s, c) => s + c.sla, 0) / counters.length

  return (
    <>
      <ModuleHero moduleKey="operations" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Ort. Bekleme Süresi" value={formatNumber(avgWait, 1)} unit="dk" icon={Clock4} delta={-12.4} higherIsBetter={false} trend={wait.map((w) => w.bekleme)} color="var(--chart-1)" />
        <KpiCard label="KPI Eşiği Aşımı" value={String(breaches)} unit="saat dilimi" icon={AlarmClock} hint={`eşik ${WAIT_KPI_MINUTES} dk`} color="var(--chart-4)" />
        <KpiCard label="Ort. Etkileşim Süresi" value="4:31" unit="dk" icon={Handshake} delta={-3.2} higherIsBetter={false} hint="gişe personeli / müşteri" color="var(--chart-2)" />
        <KpiCard label="SLA Uyum Oranı" value={`%${formatNumber(avgSla, 1)}`} icon={Gauge} delta={2.3} hint="hedef %92" color="var(--chart-5)" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Kuyruk ve Bekleme Analizi</CardTitle>
          <CardDescription>Gişe önü ve bekleme alanlarında geçirilen ortalama süre</CardDescription>
          <CardAction>
            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
              KPI eşiği: {WAIT_KPI_MINUTES} dk
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={waitConfig} className="aspect-auto h-[300px] w-full">
            <LineChart data={wait} margin={{ left: -16, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={WAIT_KPI_MINUTES} stroke="var(--destructive)" strokeDasharray="6 4" label={{ value: 'KPI', position: 'insideTopRight', fill: 'var(--destructive)', fontSize: 11 }} />
              <Line dataKey="bekleme" type="monotone" stroke="var(--color-bekleme)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line dataKey="hizmet" type="monotone" stroke="var(--color-hizmet)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Gişe Performansı ve SLA Takibi</CardTitle>
          <CardDescription>Personel / müşteri etkileşim süreleri · bugün</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Gişe</TableHead>
                <TableHead>Personel</TableHead>
                <TableHead className="hidden sm:table-cell">Tür</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
                <TableHead className="text-right">Ort. Hizmet</TableHead>
                <TableHead className="w-[200px] pr-6">SLA Uyumu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counters.map((c) => (
                <TableRow key={c.no}>
                  <TableCell className="pl-6 font-medium">Gişe {c.no}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {c.staff}
                      <Badge variant="outline" className={statusBadge[c.status].cls}>
                        {statusBadge[c.status].label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{c.type}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.transactions}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatDuration(c.avgService)}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center gap-2">
                      <Progress value={c.sla} className={cn('h-1.5', c.sla < 92 && '[&_[data-slot=progress-indicator]]:bg-red-500')} />
                      <span className={cn('w-12 text-right text-xs tabular-nums', c.sla < 92 && 'text-red-600 dark:text-red-400')}>%{formatNumber(c.sla, 1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4">
        <ModuleAlarms moduleKey="operations" title="KPI Aşım Uyarıları" />
      </div>
    </>
  )
}
