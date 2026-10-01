import { useEffect, useMemo, useState } from 'react'
import { Check, Cpu, Layers, Plus, Presentation, Sparkles, Target } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { extraCategories, extraKpiImpact, extraModules, extraPhases, type ExtraCategory } from '@/data/extra-modules'
import { modules } from '@/data/modules'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'hv.extra.selected'

const priorityCls = {
  Kritik: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  Yüksek: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Orta: 'border-border bg-muted text-muted-foreground',
}

function readSelected(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function ExtraModulesPage() {
  const [filter, setFilter] = useState<ExtraCategory | 'all' | 'selected'>('all')
  const [selected, setSelected] = useState<number[]>(readSelected)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    } catch {
      /* depolama kapalıysa seçim yalnızca bu oturumda kalır */
    }
  }, [selected])

  const list = useMemo(
    () => extraModules.filter((m) => (filter === 'all' ? true : filter === 'selected' ? selected.includes(m.no) : m.category === filter)),
    [filter, selected],
  )

  const toggle = (no: number, title: string) => {
    const on = selected.includes(no)
    setSelected((s) => (on ? s.filter((x) => x !== no) : [...s, no]))
    toast.success(on ? 'Talep listesinden çıkarıldı' : 'Talep listesine eklendi', { description: `M${no} · ${title}` })
  }

  const catOf = (key: ExtraCategory) => extraCategories.find((c) => c.key === key)!

  return (
    <>
      <PageHeader
        title="Ek Modüller"
        description="Mevcut kamera ve AI altyapısının üzerine eklenebilecek analizler, KPI hedefleri ve devreye alma planı"
        actions={
          <Button asChild>
            <a href="/sunum" target="_blank" rel="noreferrer">
              <Presentation /> Sunumu Aç
            </a>
          </Button>
        }
      />

      {/* Üst banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border bg-[oklch(0.16_0.02_270)] text-white sm:mb-6">
        <SmartImage src="/images/kameralar/giriskamerasi2.jpg" alt="" hint={false} className="absolute inset-0 size-full opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.03_270/0.96)] via-[oklch(0.14_0.03_270/0.8)] to-[oklch(0.14_0.03_270/0.2)]" />
        <div className="absolute -bottom-24 -left-10 size-72 rounded-full bg-[oklch(0.77_0.13_212/0.3)] blur-3xl" />
        <div className="relative grid gap-6 p-5 sm:p-6 md:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="max-w-2xl">
            <Badge variant="outline" className="gap-1.5 border-white/20 bg-white/10 text-white">
              <Sparkles className="text-[oklch(0.77_0.13_212)]" /> Genişleme yol haritası
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
              Aynı kameralar, {modules.length} modülden <span className="text-[oklch(0.82_0.12_212)]">{modules.length + extraModules.length} modüle</span>
            </h2>
            <p className="mt-3 text-sm text-white/75 md:text-base">
              Bugün çalışan {modules.length} yapay zekâ modülü şubedeki kameraların yalnızca bir kısmını kullanıyor. Aşağıdaki {extraModules.length} ek modül aynı RTSP
              akışları ve aynı on-premise AI sunucusu üzerinde çalışır; yeni kamera ya da bulut bağlantısı gerektirmez.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Layers, value: extraModules.length, label: 'ek modül' },
              { icon: Target, value: extraKpiImpact.length, label: 'KPI hedefi' },
              { icon: Cpu, value: '0', label: 'ek donanım' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <s.icon className="size-4 text-[oklch(0.77_0.13_212)]" />
                <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI etkileri */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {extraKpiImpact.map((k) => (
          <Card key={k.label} className="gap-0 py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-primary">{k.target}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">{k.modules.map((n) => `M${n}`).join(' · ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">KPI değerleri hedef aralıklardır; pilot şubede ölçülerek kesinleşir.</p>

      {/* Filtre */}
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { key: 'all' as const, label: `Tümü (${extraModules.length})` },
          ...extraCategories.map((c) => ({ key: c.key, label: `${c.label} (${extraModules.filter((m) => m.category === c.key).length})` })),
          { key: 'selected' as const, label: `Talep listem (${selected.length})` },
        ].map((f) => (
          <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'outline'} onClick={() => setFilter(f.key)}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Modül kartları */}
      {list.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((m) => {
            const cat = catOf(m.category)
            const on = selected.includes(m.no)
            return (
              <Card key={m.key} className={cn('group gap-0 overflow-hidden py-0 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10', on && 'ring-2 ring-primary')}>
                <div className="relative aspect-[16/8] overflow-hidden">
                  <SmartImage src={m.image} alt={m.title} className="size-full transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge variant="outline" className="border-white/20 bg-black/40 font-mono text-white backdrop-blur">
                      M{m.no}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 border-white/20 bg-black/40 text-white backdrop-blur">
                      <span className="size-1.5 rounded-full" style={{ background: cat.color }} /> {cat.label}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="absolute top-3 right-3 border-white/20 bg-white/15 text-white backdrop-blur">
                    Faz {m.phase}
                  </Badge>
                  <div className="absolute right-4 bottom-3 left-4 flex items-end gap-3 text-white">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur" style={{ color: cat.color }}>
                      <m.icon className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{m.title}</p>
                      <p className="truncate text-xs text-white/65">{m.subtitle}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                  <ul className="space-y-1.5 text-sm">
                    {m.outputs.map((o) => (
                      <li key={o} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {o}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                    {m.kpis.map((k) => (
                      <div key={k.label} className="rounded-lg border bg-muted/40 p-2.5">
                        <p className="text-base font-semibold tracking-tight">{k.value}</p>
                        <p className="text-[11px] leading-tight text-muted-foreground">{k.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Cpu className="mr-1 inline size-3.5 align-[-2px]" />
                    {m.infra}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {m.weeks}
                      <Badge variant="outline" className={priorityCls[m.priority]}>
                        {m.priority}
                      </Badge>
                    </div>
                    <Button size="sm" variant={on ? 'default' : 'outline'} onClick={() => toggle(m.no, m.title)}>
                      {on ? <Check /> : <Plus />} {on ? 'Talep listesinde' : 'Talep listesine ekle'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="mt-4">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">Talep listeniz boş. Kartlardaki “Talep listesine ekle” ile modül seçin.</CardContent>
        </Card>
      )}

      {/* Yol haritası */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Devreye Alma Yol Haritası</CardTitle>
          <CardDescription>
            {selected.length ? `${selected.length} modül talep listenizde · vurgulu gösteriliyor` : 'Talep listesine eklediğiniz modüller burada vurgulanır'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {extraPhases.map((p) => (
            <div key={p.no} className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">
                  Faz {p.no} · {p.title}
                </p>
                <span className="font-mono text-xs text-primary">{p.range}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-3 space-y-1.5">
                {extraModules
                  .filter((m) => m.phase === p.no)
                  .map((m) => (
                    <li
                      key={m.key}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm',
                        selected.includes(m.no) && 'border-primary/60 shadow-[inset_3px_0_0_var(--primary)]',
                      )}
                    >
                      <span className="font-mono text-[11px] text-muted-foreground">M{m.no}</span>
                      <span className="truncate">{m.title}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{m.weeks}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
