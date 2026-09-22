import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppLayout } from '@/layouts/app-layout'
import { AuthProvider } from '@/lib/auth'
import { AlarmsPage } from '@/pages/alarms'
import { BranchesPage } from '@/pages/branches'
import { CamerasPage } from '@/pages/cameras'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { AtmPage } from '@/pages/modules/atm'
import { CashPage } from '@/pages/modules/cash'
import { FraudPage } from '@/pages/modules/fraud'
import { InsightPage } from '@/pages/modules/insight'
import { OperationsPage } from '@/pages/modules/operations'
import { UsersPage } from '@/pages/users'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h2 className="mt-2 text-2xl font-semibold">Sayfa bulunamadı</h2>
      <Button asChild className="mt-6">
        <Link to="/">Genel Bakış'a dön</Link>
      </Button>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="hv.theme">
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/giris" element={<LoginPage />} />
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="alarmlar" element={<AlarmsPage />} />
                <Route path="moduller/dolandiricilik-onleme" element={<FraudPage />} />
                <Route path="moduller/musteri-icgorusu" element={<InsightPage />} />
                <Route path="moduller/operasyonel-verimlilik" element={<OperationsPage />} />
                <Route path="moduller/nakit-guvenligi" element={<CashPage />} />
                <Route path="moduller/atm-guvenligi" element={<AtmPage />} />
                <Route path="kameralar" element={<CamerasPage />} />
                <Route path="subeler" element={<BranchesPage />} />
                <Route path="yetkiler" element={<UsersPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors={false} />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
