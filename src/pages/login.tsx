import { useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, Building, Building2, Eye, EyeOff, Landmark, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { brand } from '@/config/brand'
import { demoUsers, roleLabel, useAuth, type Role } from '@/lib/auth'

const roleCards: Record<Role, { icon: typeof Landmark; scope: string }> = {
  'genel-mudurluk': { icon: Landmark, scope: 'Tüm şubeler · tam yetki' },
  'bolge-muduru': { icon: Building2, scope: 'Anadolu 1. Bölge · 3 şube' },
  'sube-muduru': { icon: Building, scope: 'Yalnızca Ataşehir Merkez' },
  guvenlik: { icon: ShieldCheck, scope: 'Kendi şubesinin alarmları' },
}

const stats = [
  { value: '%99,3', label: 'Tanıma doğruluğu' },
  { value: '< 1 sn', label: 'Alarm süresi' },
  { value: '7/24', label: 'Otonom izleme' },
]

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (user) return <Navigate to={from} replace />

  const doLogin = async (mail: string, pw: string, key: string) => {
    setError(null)
    setLoading(key)
    try {
      await login(mail, pw, remember)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı.')
      setLoading(null)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void doLogin(email, password, 'form')
  }

  return (
    // Giriş ekranı her zaman koyu marka temasında
    <div className="dark relative min-h-svh overflow-hidden bg-[oklch(0.12_0.02_245)] text-foreground">
      {/* Hareketli ışık arka planı */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute -top-[20%] -left-[10%] size-[70vmax] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="animate-aurora absolute -right-[15%] -bottom-[25%] size-[65vmax] rounded-full bg-violet-600/20 blur-[130px] [animation-delay:-8s]" />
        <div className="animate-aurora absolute top-[30%] left-[40%] size-[40vmax] rounded-full bg-sky-500/10 blur-[110px] [animation-delay:-4s]" />
        <img src={brand.logoMark} alt="" className="animate-spin-slow absolute top-1/2 left-1/2 size-[120vmax] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.025] lg:left-[30%] lg:size-[85vmax]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <BrandLogo onDark imgClassName="h-7 sm:h-8" />
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Tüm sistemler çalışıyor
          </span>
        </header>

        <div className="grid flex-1 items-center gap-7 py-7 sm:gap-10 sm:py-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-12">
          {/* Sol: mesaj */}
          <section className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
              Yapay Zekâ Destekli Güvenlik
            </span>
            <h1 className="mt-4 text-[32px] sm:mt-5 leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Kameralarınız artık{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-400 bg-clip-text text-transparent">görüyor ve anlıyor.</span>
            </h1>
            <p className="mt-4 hidden max-w-lg text-white/60 sm:block sm:text-base">{brand.product}. Mevcut kameralarınızla, yeni donanım yatırımı olmadan.</p>

            <dl className="mt-8 hidden max-w-lg grid-cols-3 gap-3 sm:grid">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                  <dt className="text-xs text-white/50">{s.label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Sağ: cam kart */}
          <section className="relative w-full lg:max-w-md lg:justify-self-end">
            <div aria-hidden className="absolute -inset-px rounded-3xl bg-gradient-to-b from-cyan-300/40 via-white/10 to-violet-400/30" />
            <div className="relative rounded-3xl bg-[oklch(0.16_0.02_245/0.85)] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Giriş yapın</h2>
              <p className="mt-1.5 text-sm text-white/55">Veri ve Alarm Yönetim Paneli</p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">
                    E-posta
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/40" />
                    <Input id="email" type="email" inputMode="email" autoComplete="username" placeholder="ad.soyad@kurum.com.tr" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-white/10 bg-white/5 pl-10 text-base text-white placeholder:text-white/30 sm:text-sm" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white/80">
                      Şifre
                    </Label>
                    <button type="button" className="text-xs text-cyan-300 hover:underline">
                      Şifremi unuttum
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/40" />
                    <Input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-white/10 bg-white/5 px-10 text-base text-white placeholder:text-white/30 sm:text-sm" required />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 hover:text-white" aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}>
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                  Beni hatırla
                </label>

                {error && (
                  <p className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                  </p>
                )}

                <Button type="submit" className="group h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95" disabled={!!loading}>
                  {loading === 'form' ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Giriş Yap <ArrowRight className="transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-[11px] tracking-wide text-white/40 uppercase">
                <span className="h-px flex-1 bg-white/10" />
                Demo · tek tıkla giriş
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid gap-2">
                {demoUsers.map((u) => {
                  const rc = roleCards[u.role]
                  return (
                    <button
                      key={u.email}
                      type="button"
                      disabled={!!loading}
                      onClick={() => void doLogin(u.email, u.password, u.email)}
                      className="group flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/5 active:scale-[0.99] disabled:opacity-60"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                        <rc.icon className="size-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{roleLabel[u.role]}</span>
                        <span className="block truncate text-xs text-white/45">{rc.scope}</span>
                      </span>
                      {loading === u.email ? (
                        <Loader2 className="size-4 animate-spin text-cyan-300" />
                      ) : (
                        <ArrowRight className="size-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col items-center justify-between gap-1 text-center text-xs text-white/35 sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} {brand.name} · {brand.slogan}</span>
          <span>{brand.support}</span>
        </footer>
      </div>
    </div>
  )
}
