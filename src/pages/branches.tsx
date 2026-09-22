import { Cctv, Landmark, MapPin, Users } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { branchStatusLabel, regionById, type Branch } from '@/data/branches'
import { useNotifications } from '@/lib/notifications'
import { useScope } from '@/lib/scope'
import { cn } from '@/lib/utils'

const statusCls: Record<Branch['status'], string> = {
  pilot: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  kurulum: 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  planlandi: 'border-border bg-muted text-muted-foreground',
}

const steps = ['Şube Seçimi', 'Keşif ve Kalibrasyon', 'Sistem Kurulumu', 'Teslim & Canlı']
const stepIndex: Record<Branch['status'], number> = { planlandi: 0, kurulum: 2, pilot: 4 }

export function BranchesPage() {
  const { branches, setBranchId, branchId } = useScope()
  const { alarms } = useNotifications()

  return (
    <>
      <PageHeader title="Şubeler" description="Pilot şube İstanbul Anadolu Yakası'nda · aksiyon planı ilerleme durumu" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b) => {
          const done = stepIndex[b.status]
          const open = alarms.filter((a) => a.branchId === b.id && a.status === 'yeni').length
          return (
            <Card key={b.id} className={cn('gap-0 overflow-hidden py-0', branchId === b.id && 'ring-2 ring-primary')}>
              <div className="relative aspect-[16/7]">
                <SmartImage src={b.image} alt={b.name} className="size-full" />
                <Badge variant="outline" className={cn('absolute top-3 left-3 backdrop-blur', statusCls[b.status])}>
                  {branchStatusLabel[b.status]}
                </Badge>
                {open > 0 && <Badge className="absolute top-3 right-3 bg-red-600 text-white">{open} yeni alarm</Badge>}
              </div>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-lg font-semibold">{b.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {b.district} · {regionById(b.regionId)?.name}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {[
                    { icon: Cctv, label: 'Kamera', v: b.cameras },
                    { icon: Landmark, label: 'ATM', v: b.atms },
                    { icon: Users, label: 'Kapasite', v: b.capacity },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border bg-muted/30 py-2">
                      <s.icon className="mx-auto size-4 text-muted-foreground" />
                      <p className="mt-1 font-semibold tabular-nums">{s.v}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Aksiyon planı</p>
                  <div className="flex gap-1">
                    {steps.map((s, i) => (
                      <div key={s} className="flex-1" title={s}>
                        <div className={cn('h-1.5 rounded-full', i < done ? 'bg-primary' : 'bg-muted')} />
                        <p className={cn('mt-1 truncate text-[10px]', i < done ? 'text-foreground' : 'text-muted-foreground')}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setBranchId(b.id)} disabled={branchId === b.id}>
                  {branchId === b.id ? 'Görüntüleniyor' : 'Bu şubeye odaklan'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
