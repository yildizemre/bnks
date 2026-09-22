import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AlarmDetailDialog } from '@/components/alarm-detail-dialog'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth'
import { NotificationProvider } from '@/lib/notifications'
import { ScopeProvider } from '@/lib/scope'

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/giris" replace state={{ from: location.pathname }} />

  return (
    <ScopeProvider>
      <NotificationProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="relative isolate md:border md:border-border/60">
            {/* Arka plan ışımaları */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden md:rounded-xl">
              <div className="absolute -top-40 left-1/4 size-[520px] rounded-full bg-primary/10 blur-[120px]" />
              <div className="absolute top-1/3 -right-40 size-[420px] rounded-full bg-chart-2/10 blur-[120px]" />
            </div>
            <SiteHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="mx-auto max-w-[1600px] animate-in duration-300 fade-in slide-in-from-bottom-1">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
          <AlarmDetailDialog />
        </SidebarProvider>
      </NotificationProvider>
    </ScopeProvider>
  )
}
