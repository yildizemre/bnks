import { useMemo } from 'react'
import { AlertTriangle, BellRing, CheckCircle2, LayoutGrid, List, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AlarmCard } from '@/components/alarm-items'
import { KpiCard } from '@/components/kpi-card'
import { PageHeader } from '@/components/page-header'
import { SeverityBadge, StatusBadge } from '@/components/severity-badge'
import { SmartImage } from '@/components/smart-image'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AlarmStatus, Severity } from '@/data/alarms'
import { branchById } from '@/data/branches'
import { moduleByKey, modules } from '@/data/modules'
import { formatClock, timeAgo } from '@/lib/format'
import { useNotifications } from '@/lib/notifications'
import { severityMeta, statusMeta } from '@/lib/severity'

export function AlarmsPage() {
  const { alarms, openAlarm } = useNotifications()
  const [params, setParams] = useSearchParams()
  const mod = params.get('modul') ?? 'all'
  const sev = params.get('seviye') ?? 'all'
  const status = params.get('durum') ?? 'all'
  const view = params.get('gorunum') ?? 'grid'
  const q = params.get('q') ?? ''

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(
    () =>
      alarms.filter(
        (a) =>
          (mod === 'all' || a.module === mod) &&
          (sev === 'all' || a.severity === sev) &&
          (status === 'all' || a.status === status) &&
          (!q || `${a.id} ${a.title} ${a.type} ${a.camera} ${branchById(a.branchId)?.name}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [alarms, mod, sev, status, q],
  )

  const open = alarms.filter((a) => a.status === 'yeni' || a.status === 'inceleniyor')
  const falseRate = (alarms.filter((a) => a.status === 'yanlis').length / Math.max(1, alarms.length)) * 100

  return (
    <>
      <PageHeader title="Alarm Merkezi" description="Tüm modüllerden gelen olaylar, görsel kanıtlarıyla birlikte" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Açık Alarm" value={String(open.length)} icon={BellRing} color="var(--chart-1)" hint="yeni + incelenen" />
        <KpiCard label="Kritik (Açık)" value={String(open.filter((a) => a.severity === 'kritik').length)} icon={AlertTriangle} color="var(--chart-4)" />
        <KpiCard label="Kapatılan (24s)" value={String(alarms.filter((a) => a.status === 'kapandi').length)} icon={CheckCircle2} color="var(--chart-5)" />
        <KpiCard label="Yanlış Alarm Oranı" value={`%${falseRate.toFixed(1).replace('.', ',')}`} icon={AlertTriangle} color="var(--chart-3)" hint="hedef < %5" />
      </div>

      <Card className="mt-4 py-4">
        <CardContent className="flex flex-col gap-3 px-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Alarm no, kamera, şube ara…" className="pl-8" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select value={mod} onValueChange={(v) => set('modul', v)}>
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue placeholder="Modül" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm modüller</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    M{m.no} · {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sev} onValueChange={(v) => set('seviye', v)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm seviyeler</SelectItem>
                {(Object.keys(severityMeta) as Severity[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {severityMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => set('durum', v)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm durumlar</SelectItem>
                {(Object.keys(statusMeta) as AlarmStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs className="justify-self-end" value={view} onValueChange={(v) => set('gorunum', v === 'grid' ? '' : v)}>
              <TabsList>
                <TabsTrigger value="grid" aria-label="Kart görünümü">
                  <LayoutGrid />
                </TabsTrigger>
                <TabsTrigger value="list" aria-label="Liste görünümü">
                  <List />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 mb-3 text-sm text-muted-foreground">{filtered.length} olay listeleniyor</p>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((a) => (
            <AlarmCard key={a.id} alarm={a} />
          ))}
        </div>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Olay</TableHead>
                <TableHead className="hidden md:table-cell">Modül</TableHead>
                <TableHead className="hidden lg:table-cell">Şube / Kamera</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead className="hidden sm:table-cell">Durum</TableHead>
                <TableHead className="pr-4 text-right">Zaman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const m = moduleByKey(a.module)
                return (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => openAlarm(a.id)}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <SmartImage src={a.image} alt={a.title} hint={false} className="h-10 w-14 shrink-0 rounded-md border" />
                        <div className="min-w-0">
                          <p className={a.read ? 'truncate' : 'truncate font-semibold'}>{a.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">{a.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <m.icon className="size-3.5" style={{ color: m.color }} /> {a.type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {branchById(a.branchId)?.name}
                      <p className="text-xs text-muted-foreground">{a.camera}</p>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={a.severity} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="pr-4 text-right text-sm tabular-nums">
                      {formatClock(a.time)}
                      <p className="text-xs text-muted-foreground">{timeAgo(a.time)}</p>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {!filtered.length && <p className="py-16 text-center text-sm text-muted-foreground">Filtrelere uyan olay bulunamadı.</p>}
    </>
  )
}
