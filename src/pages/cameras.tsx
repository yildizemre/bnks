import { useState } from 'react'
import { AlertTriangle, Cctv, ScanFace, Wifi, WifiOff, Wrench } from 'lucide-react'
import { KpiCard } from '@/components/kpi-card'
import { PageHeader } from '@/components/page-header'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { branchById } from '@/data/branches'
import { cameras } from '@/data/metrics'
import { useScope } from '@/lib/scope'
import { cn } from '@/lib/utils'

const zones = ['Tümü', 'Giriş', 'Bekleme', 'Gişe', 'Banko', 'ATM'] as const

export function CamerasPage() {
  const { scopeIds } = useScope()
  const [zone, setZone] = useState<(typeof zones)[number]>('Tümü')
  const scoped = cameras.filter((c) => scopeIds.includes(c.branchId))
  const list = scoped.filter((c) => zone === 'Tümü' || c.zone === zone)
  const online = scoped.filter((c) => c.online).length
  const needsFix = scoped.filter((c) => c.recommendation)
  const avgScore = scoped.reduce((s, c) => s + c.faceScore, 0) / Math.max(1, scoped.length)

  return (
    <>
      <PageHeader title="Kameralar" description="Faz 1 · Saha analizi ve kamera optimizasyonu — marka bağımsız RTSP entegrasyonu" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Toplam Kamera" value={String(scoped.length)} icon={Cctv} hint="yeni kamera yatırımı gerekmez" color="var(--chart-1)" />
        <KpiCard label="Çevrimiçi" value={`${online}/${scoped.length}`} icon={Wifi} hint="RTSP akışı aktif" color="var(--chart-5)" />
        <KpiCard label="Yüz Tanıma Uygunluğu" value={`%${Math.round(avgScore)}`} icon={ScanFace} hint="ortalama standart skoru" color="var(--chart-2)" />
        <KpiCard label="Kalibrasyon Önerisi" value={String(needsFix.length)} icon={Wrench} hint="açı / FPS / shutter" color="var(--chart-3)" />
      </div>

      {needsFix.length > 0 && (
        <Card className="mt-4 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" /> Konfigürasyon Önerileri
            </CardTitle>
            <CardDescription>AI motorunun en verimli çalışacağı çözünürlük, FPS, bitrate ve shutter ayarları</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {needsFix.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm">
                <Wrench className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="font-medium">
                    {c.name} <span className="font-mono text-xs text-muted-foreground">· {c.id}</span>
                  </p>
                  <p className="text-muted-foreground">{c.recommendation}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 mb-4 flex items-center justify-between gap-3">
        <Tabs value={zone} onValueChange={(v) => setZone(v as typeof zone)}>
          <TabsList className="flex-wrap">
            {zones.map((z) => (
              <TabsTrigger key={z} value={z}>
                {z}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="hidden text-sm text-muted-foreground sm:block">{list.length} kamera</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((c) => (
          <Card key={c.id} className="gap-0 overflow-hidden py-0">
            <div className="relative aspect-video bg-black">
              <SmartImage src={c.image} alt={c.name} className={cn('size-full', !c.online && 'opacity-30 grayscale')} />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
                <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">{c.id}</span>
                {c.online ? (
                  <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" /> CANLI
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <WifiOff className="size-3" /> ÇEVRİMDIŞI
                  </span>
                )}
              </div>
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {branchById(c.branchId)?.name} · {c.model}
                  </p>
                </div>
                <Badge variant="secondary">{c.zone}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Çözünürlük</p>
                  <p className="font-medium tabular-nums">{c.resolution.split('×')[1]}p</p>
                </div>
                <div>
                  <p className="text-muted-foreground">FPS</p>
                  <p className={cn('font-medium tabular-nums', c.fps < 20 && 'text-amber-600 dark:text-amber-400')}>{c.fps}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bitrate</p>
                  <p className="font-medium tabular-nums">{(c.bitrate / 1024).toFixed(0)} Mb</p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Yüz tanıma uygunluğu</span>
                  <span className={cn('font-medium tabular-nums', c.faceScore < 75 && 'text-amber-600 dark:text-amber-400')}>%{c.faceScore}</span>
                </div>
                <Progress value={c.faceScore} className={cn('h-1.5', c.faceScore < 75 && '[&_[data-slot=progress-indicator]]:bg-amber-500')} />
              </div>
              <div className="flex flex-wrap gap-1">
                {c.modules.map((m) => (
                  <Badge key={m} variant="outline" className="font-mono text-[10px]">
                    {m}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
