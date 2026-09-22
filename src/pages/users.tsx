import { Check, Minus, UserPlus } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { initials } from '@/components/app-sidebar'
import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { branchById, regionById } from '@/data/branches'
import { demoUsers, roleLabel, useAuth, type Role } from '@/lib/auth'

const permissions: { label: string; roles: Role[] }[] = [
  { label: 'Tüm şubelerin verileri ve alarmları', roles: ['genel-mudurluk'] },
  { label: 'Bağlı bölge şubelerinin verileri', roles: ['genel-mudurluk', 'bolge-muduru'] },
  { label: 'Kendi şubesinin anlık alarmları', roles: ['genel-mudurluk', 'bolge-muduru', 'sube-muduru', 'guvenlik'] },
  { label: 'Yoğunluk ve doluluk durumu', roles: ['genel-mudurluk', 'bolge-muduru', 'sube-muduru', 'guvenlik'] },
  { label: 'Personel performans grafikleri', roles: ['genel-mudurluk', 'bolge-muduru', 'sube-muduru'] },
  { label: 'Kara liste yönetimi', roles: ['genel-mudurluk'] },
  { label: 'Kullanıcı ve yetki yönetimi', roles: ['genel-mudurluk'] },
]
const roles: Role[] = ['genel-mudurluk', 'bolge-muduru', 'sube-muduru', 'guvenlik']

export function UsersPage() {
  const { user } = useAuth()
  if (user?.role !== 'genel-mudurluk') return <Navigate to="/" replace />

  return (
    <>
      <PageHeader
        title="Kullanıcı & Yetkiler"
        description="Rol tabanlı erişim (RBAC) · her kullanıcı yalnızca yetkili olduğu kapsamı görür"
        actions={
          <Button onClick={() => toast.info('Kullanıcı davet formu', { description: 'Backend / LDAP entegrasyonu sonrası aktif olacak.' })}>
            <UserPlus /> Kullanıcı Ekle
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Yetkilendirme Matrisi</CardTitle>
          <CardDescription>Genel Müdürlük → Bölge Müdürü → Şube Müdürü / Güvenlik</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Yetki</TableHead>
                {roles.map((r) => (
                  <TableHead key={r} className="text-center">
                    {roleLabel[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p) => (
                <TableRow key={p.label}>
                  <TableCell className="pl-6">{p.label}</TableCell>
                  {roles.map((r) => (
                    <TableCell key={r} className="text-center">
                      {p.roles.includes(r) ? <Check className="mx-auto size-4 text-emerald-500" /> : <Minus className="mx-auto size-4 text-muted-foreground/50" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>Bildirim kanalları: panel (sesli/görsel), e-posta, SMS</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Kapsam</TableHead>
                <TableHead className="text-center">E-posta</TableHead>
                <TableHead className="pr-6 text-center">SMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback className="bg-primary/15 text-primary">{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabel[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {u.branchId ? branchById(u.branchId)?.name : u.regionId ? regionById(u.regionId)?.name : 'Tüm şubeler'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch defaultChecked aria-label="E-posta bildirimi" />
                  </TableCell>
                  <TableCell className="pr-6 text-center">
                    <Switch defaultChecked={u.role !== 'bolge-muduru'} aria-label="SMS bildirimi" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
