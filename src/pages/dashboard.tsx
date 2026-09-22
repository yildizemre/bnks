import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, Cctv, Clock4, Download, Gauge, ScanFace, UsersRound } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AlarmListItem } from '@/components/alarm-items'
import { KpiCard } from '@/components/kpi-card'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { branchById } from '@/data/branches'
import { cameras, hourlyTraffic } from '@/data/metrics'
import { modules } from '@/data/modules'
import { useAuth } from '@/lib/auth'
import { formatInt, formatLongDate, formatNumber } from '@/lib/format'
import { useNotifications } from '@/lib/notifications'
import { useScope } from '@/lib/scope'

const trafficConfig = {
  musteri: { label: 'Müşteri', color: 'var(--chart-1)' },
  personel: { label: 'Personel', color: 'var(--chart-2)' },
} satisfies ChartConfig

const occupancyNow = [0.72, 0.58, 0.41, 0.33, 0.49, 0.64]

export function DashboardPage() {
  const { user } = useAuth()
  const { factor, scopeIds, branches, branchId } = useScope()
  const { alarms } = useNotifications()

  const traffic = useMemo(() => hourlyTraffic(factor), [factor])
  const netVisitors = traffic.reduce((s, h) => s + h.musteri, 0)
  const todayAlarms = alarms.filter((a) => Date.now() - a.time.getTime() < 24 * 3600_000)
  const openCritical = alarms.filter((a) => a.severity === 'kritik' && (a.status === 'yeni' || a.status === 'inceleniyor')).length
  const fraudMatches = todayAlarms.filter((a) => a.module === 'fraud').length
  const scopedCams = cameras.filter((c) => scopeIds.includes(c.branchId))
  const onlineCams = scopedCams.filter((c) => c.online).length

  const byModule = modules.map((m) => ({ key: m.key, name: m.title, value: todayAlarms.filter((a) => a.module === m.key).length, fill: m.color }))
  const moduleConfig = Object.fromEntries(modules.map((m) => [m.key, { label: m.title, color: m.color }])) satisfies ChartConfig

  const scopeLabel = branchId === 'all' ? `${branches.length} şube` : branchById(branchId)?.name

  return (
    <>
      <PageHeader
        title={`Hoş geldiniz, ${user?.name.split(' ')[0]}`}
        description={
          <>
            {formatLongDate(new Date())} · {scopeLabel} için anlık durum
          </>
        }
        actions={
          <Button variant="outline" onClick={() => toast.info('Rapor hazırlanıyor', { description: 'Günlük yönetim raporu PDF olarak indirilecek.' })}>
            <Download /> Günlük Rapor
          </Button>
        }
      />

      {/* KPI satırı */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Bugün Net Ziyaretçi" value={formatInt(netVisitors)} icon={UsersRound} delta={8.2} hint="dün aynı saate göre" trend={traffic.map((t) => t.musteri)} color="var(--chart-1)" />
        <KpiCard label="Ort. Bekleme Süresi" value={formatNumber(6.7 * (0.9 + Math.min(factor, 2) * 0.1), 1)} unit="dk" icon={Clock4} delta={-12.4} higherIsBetter={false} hint="KPI eşiği 10 dk" trend={[8.1, 7.6, 7.9, 7.2, 6.9, 7.1, 6.7]} color="var(--chart-2)" />
        <KpiCard label="Açık Kritik Alarm" value={String(openCritical)} icon={AlertTriangle} delta={openCritical > 2 ? 50 : -33} higherIsBetter={false} hint={`${fraudMatches} kara liste eşleşmesi`} trend={[2, 4, 1, 3, 2, 5, openCritical]} color="var(--chart-4)" />
        <KpiCard label="SLA Uyum Oranı" value="%94,1" icon={Gauge} delta={2.3} hint="hedef %92" trend={[90.2, 91.4, 92.8, 91.9, 93.1, 93.6, 94.1]} color="var(--chart-5)" />
      </div>

      {/* Modül durumları */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3 lg:grid-cols-5">
        {modules.map((m) => {
          const count = todayAlarms.filter((a) => a.module === m.key).length
          const open = alarms.filter((a) => a.module === m.key && a.status === 'yeni').length
          return (
            <Link key={m.key} to={m.path} className="group rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklch, ${m.color} 15%, transparent)`, color: m.color }}>
                  <m.icon className="size-4" />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">MODÜL {m.no}</span>
              </div>
              <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 font-medium sm:min-h-0 sm:truncate">{m.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <span className="text-base font-semibold text-foreground tabular-nums">{count}</span> olay / 24s
                </span>
                {open > 0 ? (
                  <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
                    {open} yeni
                  </Badge>
                ) : (
                  <ArrowRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Grafikler */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Saatlik Ziyaretçi Trafiği</CardTitle>
            <CardDescription>Personel trafiği yapay zekâ ile ayrıştırılmış net müşteri sayımı</CardDescription>
            <CardAction>
              <Badge variant="secondary">Bugün</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trafficConfig} className="aspect-auto h-[280px] w-full">
              <AreaChart data={traffic} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="fill-musteri" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-musteri)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-musteri)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fill-personel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-personel)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-personel)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="musteri" type="monotone" stroke="var(--color-musteri)" strokeWidth={2} fill="url(#fill-musteri)" />
                <Area dataKey="personel" type="monotone" stroke="var(--color-personel)" strokeWidth={2} fill="url(#fill-personel)" />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alarm Dağılımı</CardTitle>
            <CardDescription>Son 24 saat · modül bazında</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={moduleConfig} className="mx-auto aspect-square h-[200px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie data={byModule} dataKey="value" nameKey="key" innerRadius={62} outerRadius={90} strokeWidth={3} stroke="var(--card)">
                  {byModule.map((d) => (
                    <Cell key={d.key} fill={d.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) =>
                      viewBox && 'cx' in viewBox ? (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-semibold">
                            {todayAlarms.length}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 22} className="fill-muted-foreground text-xs">
                            olay
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-4 space-y-2 text-sm">
              {byModule.map((d) => (
                <li key={d.key} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: d.fill }} />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Son alarmlar + doluluk */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Son Alarmlar</CardTitle>
            <CardDescription>Görsele tıklayarak olay detayını açın</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/alarmlar">
                  Tümü <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {alarms.slice(0, 8).map((a) => (
              <AlarmListItem key={a.id} alarm={a} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anlık Şube Doluluğu</CardTitle>
            <CardDescription>Net müşteri / kapasite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branches.map((b, i) => {
              const pct = Math.round(occupancyNow[i % occupancyNow.length] * 100)
              const inScope = scopeIds.includes(b.id)
              return (
                <div key={b.id} className={inScope ? '' : 'opacity-40'}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="truncate">{b.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {Math.round((b.capacity * pct) / 100)}/{b.capacity}
                    </span>
                  </div>
                  <Progress value={pct} className={pct > 70 ? '[&_[data-slot=progress-indicator]]:bg-orange-500' : ''} />
                </div>
              )
            })}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Cctv className="size-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">
                  {onlineCams}/{scopedCams.length} kamera çevrimiçi
                </p>
                <p className="text-xs text-muted-foreground">RTSP akışları AI motoruna bağlı</p>
              </div>
              <ScanFace className="ml-auto size-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
