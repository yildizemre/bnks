import { useState } from 'react'
import { BellRing, Fingerprint, ScanFace, Search, Timer, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { KpiCard } from '@/components/kpi-card'
import { ModuleAlarms, ModuleHero } from '@/components/module-parts'
import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { blacklist } from '@/data/metrics'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'

const categoryStyle: Record<string, string> = {
  'Sahte Kimlik': 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
  'Dolandırıcılık Geçmişi': 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Riskli Kişi': 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

export function FraudPage() {
  const { alarms } = useNotifications()
  const [q, setQ] = useState('')
  const { user } = useAuth()
  const matches = alarms.filter((a) => a.module === 'fraud')
  const list = blacklist.filter((p) => `${p.id} ${p.alias} ${p.category}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <ModuleHero moduleKey="fraud">
        {/* Yetki matrisi: kara liste yönetimi yalnızca Genel Müdürlük'te */}
        {user?.role === 'genel-mudurluk' && (
          <Button variant="secondary" onClick={() => toast.info('Kara listeye kişi ekleme formu', { description: 'Backend bağlantısı sonrası aktif olacak.' })}>
            <UserPlus /> Kara Listeye Ekle
          </Button>
        )}
      </ModuleHero>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Kara Liste Kaydı" value={String(blacklist.length * 31 + 4)} icon={Users} delta={3.1} hint="bu ay +6 kayıt" color="var(--chart-4)" />
        <KpiCard label="Bugünkü Eşleşme" value={String(matches.filter((a) => Date.now() - a.time.getTime() < 86400_000).length)} icon={ScanFace} hint="henüz işlem yapmadan tespit" color="var(--chart-1)" />
        <KpiCard label="Ort. Uyarı Süresi" value="1,4" unit="sn" icon={Timer} delta={-18} higherIsBetter={false} hint="girişten pop-up alarma" color="var(--chart-2)" />
        <KpiCard label="Tanıma Doğruluğu" value="%99,3" icon={Fingerprint} delta={0.4} hint="Faz 1 kalibrasyonu sonrası" color="var(--chart-5)" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Kara Liste Yönetimi</CardTitle>
            <CardDescription>Sahte kimlik, dolandırıcılık geçmişi ve riskli kategorisindeki kişiler</CardDescription>
            <CardAction>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara…" className="h-8 w-40 pl-8 sm:w-56" />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Kişi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="hidden md:table-cell">Ekleyen</TableHead>
                  <TableHead className="text-right">Eşleşme</TableHead>
                  <TableHead className="pr-6 text-right">Son Görülme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <SmartImage src={p.photo} alt={p.alias} hint={false} className="size-10 rounded-lg border" />
                        <div>
                          <p className="font-medium">{p.alias}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {p.id} · {p.addedAt}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryStyle[p.category]}>
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{p.addedBy}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{p.matches}</TableCell>
                    <TableCell className="pr-6 text-right text-muted-foreground">{p.lastSeen}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uyarı Akışı</CardTitle>
            <CardDescription>Eşleşme anında kimlere bildirim gider</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l pl-6">
              {[
                { t: 'Giriş kamerası yüzü yakalar', d: 'Faz 1 standartlarına göre konumlanmış kamera' },
                { t: 'AI motoru kara listeyle karşılaştırır', d: 'On-Premise sunucuda, < 1 sn' },
                { t: 'Güvenlik birimine pop-up alarm', d: 'Sesli + görsel uyarı, referans fotoğraf ile' },
                { t: 'Şube müdürüne bildirim', d: 'Panel + opsiyonel SMS / e-posta' },
              ].map((s, i) => (
                <li key={s.t} className="relative">
                  <span className="absolute top-0 -left-[35px] flex size-6 items-center justify-center rounded-full border bg-card text-xs font-medium">{i + 1}</span>
                  <p className="text-sm font-medium">{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
              <BellRing className="mt-0.5 size-4 shrink-0" />
              Bu modülün başarısı Faz 1'deki kamera açısı düzenlemesine doğrudan bağlıdır. Uygunluk skorları için Kameralar sayfasına bakın.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <ModuleAlarms moduleKey="fraud" title="Son Kara Liste Eşleşmeleri" />
      </div>
    </>
  )
}
