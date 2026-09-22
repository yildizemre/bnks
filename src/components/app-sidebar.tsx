import { useEffect } from 'react'
import { Bell, Building2, ChevronsUpDown, Cctv, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { brand } from '@/config/brand'
import { modules } from '@/data/modules'
import { roleLabel, useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { BrandLogo } from './brand-logo'

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const { setOpenMobile } = useSidebar()
  // Telefonda bir sayfaya geçince menüyü kapat
  useEffect(() => setOpenMobile(false), [pathname, setOpenMobile])
  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  const main = [
    { title: 'Genel Bakış', path: '/', icon: LayoutDashboard },
    { title: 'Alarm Merkezi', path: '/alarmlar', icon: Bell, badge: unreadCount },
  ]
  const infra = [
    { title: 'Kameralar', path: '/kameralar', icon: Cctv },
    { title: 'Şubeler', path: '/subeler', icon: Building2 },
    ...(user?.role === 'genel-mudurluk' ? [{ title: 'Kullanıcı & Yetkiler', path: '/yetkiler', icon: ShieldCheck }] : []),
  ]

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link to="/">
                <BrandLogo className="group-data-[collapsible=icon]:hidden" />
                <BrandLogo compact className="hidden group-data-[collapsible=icon]:flex" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Genel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.title}>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {!!item.badge && <SidebarMenuBadge className="bg-red-500/15 text-red-600 dark:text-red-400">{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Yapay Zekâ Modülleri</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((m) => (
                <SidebarMenuItem key={m.key}>
                  <SidebarMenuButton asChild isActive={isActive(m.path)} tooltip={m.title}>
                    <Link to={m.path}>
                      <m.icon />
                      <span className="truncate">{m.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="font-mono text-[10px] text-muted-foreground">M{m.no}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Altyapı & Yönetim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infra.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.title}>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="relative mx-3 mt-auto mb-2 overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent p-3 text-xs group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <p className="font-medium">AI motoru çalışıyor</p>
          </div>
          <p className="mt-1 text-muted-foreground">On-Premise · KVKK uyumlu · v{brand.version}</p>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary">{initials(user?.name ?? '?')}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user && roleLabel[user.role]}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{user?.title}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserRound /> Profilim
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    logout()
                    navigate('/giris')
                  }}
                >
                  <LogOut /> Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
