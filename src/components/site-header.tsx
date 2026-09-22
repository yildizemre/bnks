import { Building2, Radio } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { BrandLogo } from './brand-logo'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { modules } from '@/data/modules'
import { useNotifications } from '@/lib/notifications'
import { useScope } from '@/lib/scope'
import { cn } from '@/lib/utils'
import { NotificationBell } from './notification-bell'
import { ThemeToggle } from './theme-toggle'

const titles: Record<string, string> = {
  '/': 'Genel Bakış',
  '/alarmlar': 'Alarm Merkezi',
  '/kameralar': 'Kameralar',
  '/subeler': 'Şubeler',
  '/yetkiler': 'Kullanıcı & Yetkiler',
  ...Object.fromEntries(modules.map((m) => [m.path, m.title])),
}

export function SiteHeader() {
  const { pathname } = useLocation()
  const { branches, branchId, setBranchId } = useScope()
  const { live, setLive } = useNotifications()
  const single = branches.length === 1

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/60 px-3 backdrop-blur-xl backdrop-saturate-150 md:rounded-t-xl md:px-5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 hidden data-[orientation=vertical]:h-5 sm:block" />
      <BrandLogo compact className="sm:hidden" imgClassName="size-7" />
      <h1 className="hidden truncate text-sm font-medium sm:block">{titles[pathname] ?? 'Panel'}</h1>

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5 md:gap-2">
        <Select value={branchId} onValueChange={setBranchId} disabled={single}>
          <SelectTrigger size="sm" className="w-[132px] min-w-0 sm:w-[170px] md:w-[210px] [&_[data-slot=select-value]]:truncate">
            <Building2 className="hidden text-muted-foreground sm:block" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {!single && <SelectItem value="all">Tüm Şubeler ({branches.length})</SelectItem>}
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger asChild>
            <label className="hidden h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-xs font-medium sm:flex">
              <Radio className={cn('size-3.5', live ? 'text-emerald-500' : 'text-muted-foreground')} />
              <span className={cn(live ? 'text-foreground' : 'text-muted-foreground')}>Canlı</span>
              <Switch checked={live} onCheckedChange={setLive} className="scale-90" />
            </label>
          </TooltipTrigger>
          <TooltipContent>Canlı alarm akışı (demo: ~40 sn'de bir)</TooltipContent>
        </Tooltip>

        {/* Telefonda Canlı anahtarı yerine ikon düğme */}
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setLive(!live)} aria-label={live ? 'Canlı akışı durdur' : 'Canlı akışı başlat'} aria-pressed={live}>
          <Radio className={cn(live ? 'text-emerald-500' : 'text-muted-foreground')} />
        </Button>
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
