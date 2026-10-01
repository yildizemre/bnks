import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BellRing,
  Building2,
  Cctv,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Cpu,
  EyeOff,
  FileBarChart,
  Fingerprint,
  Grid3x3,
  Lock,
  Maximize,
  MonitorSmartphone,
  ServerCog,
  ShieldCheck,
  Smartphone,
  UsersRound,
  Workflow,
  X,
} from 'lucide-react'
import { brand } from '@/config/brand'
import { branchStatusLabel, branches } from '@/data/branches'
import { extraCategories, extraKpiImpact, extraModules, extraPhases, type ExtraCategory } from '@/data/extra-modules'
import { modules, type ModuleKey } from '@/data/modules'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------
   Sunum — 1600×900 sahne ekrana ölçeklenir.
   ← → / boşluk / PageUp-Down · Home/End · F tam ekran · O genel görünüm
   #n adresi n. slaytı açar (1'den başlar). Dar ekranda slaytlar alt alta.
   ------------------------------------------------------------------ */

const W = 1600
const H = 900
const C = { cyan: '#38d6ee', violet: '#8f7cf8', red: '#f2556b', amber: '#f5b74a', green: '#34d399' }
const SHOT = '/images/sunum/'

const totalCameras = branches.reduce((s, b) => s + b.cameras, 0)
const totalAtms = branches.reduce((s, b) => s + b.atms, 0)
const totalCounters = branches.reduce((s, b) => s + b.counters, 0)

/** Modül slaytlarının içeriği — panel sayfalarındaki değerlerle aynı */
const moduleDeck: Record<ModuleKey, { problem: string; how: string[]; kpis: { v: string; l: string; c?: string }[]; frames: string[]; shot: string }> = {
  fraud: {
    problem: 'Sahte kimlikle işlem yapan ya da dolandırıcılık geçmişi olan kişi, şubeden çıkana kadar fark edilmiyor; aynı kişi farklı şubelerde tekrar deniyor.',
    how: ['Giriş kamerası yüzü yakalar, kalite ve açı kontrolü yapılır', 'Yüz, şifrelenmiş kara liste vektörleriyle karşılaştırılır', 'Eşleşmede güvenlik birimi ve şube müdürüne pop-up + SMS', 'Kara liste kaydı tüm şubelerde anında geçerli olur'],
    kpis: [{ v: '%99,3', l: 'Tanıma doğruluğu', c: C.green }, { v: '1,4 sn', l: 'Ortalama uyarı süresi', c: C.cyan }, { v: '190', l: 'Kara liste kaydı' }, { v: '0', l: 'İşlem öncesi kaçan eşleşme', c: C.green }],
    frames: ['/images/dolandiricilik/dolandir1.jpg', '/images/dolandiricilik/dolandir2.jpg', '/images/dolandiricilik/dolandir5.jpg'],
    shot: 'panel-dolandiricilik.jpg',
  },
  insight: {
    problem: 'Şubeye kaç müşterinin geldiği, hangi saatlerde yoğunlaştığı ve kim olduğu bilinmiyor; personel giriş-çıkışları sayımları şişiriyor.',
    how: ['Giriş ve bekleme kameralarında kişi sayımı', 'Personel yapay zekâ ile ayrıştırılır, net müşteri sayılır', 'Anonim yaş aralığı ve cinsiyet tahmini (görüntü saklanmaz)', 'Saatlik, haftalık ve şubeler arası karşılaştırma'],
    kpis: [{ v: '6.420', l: 'Bugün net müşteri', c: C.cyan }, { v: '496', l: 'Ayrıştırılan personel geçişi', c: C.violet }, { v: '12:00', l: 'En yoğun saat' }, { v: '%46 / %54', l: 'Kadın / erkek' }],
    frames: ['/images/kameralar/beklemealani1.jpg', '/images/kameralar/giriskamerasi4.jpg', '/images/kameralar/beklemealani.jpg'],
    shot: 'panel-icgoru.jpg',
  },
  operations: {
    problem: 'Kuyruk ve bekleme süresi gözle takip ediliyor; KPI aşımı ancak müşteri şikâyet ettiğinde fark ediliyor, gişe performansı ölçülemiyor.',
    how: ['Gişe önü kuyruk uzunluğu ve bekleme süresi dakikalık ölçülür', '10 dk KPI eşiği yaklaşınca şube müdürüne uyarı', 'Boş gişe ve uzun etkileşim tespit edilir', 'Gişe bazlı SLA uyumu günlük raporlanır'],
    kpis: [{ v: '−%12,4', l: 'Ortalama bekleme süresi', c: C.green }, { v: '%94,8', l: 'SLA uyumu (hedef %92)', c: C.cyan }, { v: '4:31', l: 'Ort. gişe etkileşimi' }, { v: '10 dk', l: 'KPI eşiği', c: C.amber }],
    frames: ['/images/operasyonel/oper1.jpg', '/images/operasyonel/oper4.jpg', '/images/operasyonel/oper3.jpg'],
    shot: 'panel-operasyon.jpg',
  },
  cash: {
    problem: 'Banko üzerinde sahipsiz kalan nakit hem hırsızlık hem de iç denetim riski; bugün yalnızca olay sonrası kayıttan inceleniyor.',
    how: ['Banko yüzeyi sürekli izlenir, nakit ve personel varlığı ayrıştırılır', 'Nakit, personel yokken eşik süresini aşarsa sessiz alarm', 'Olay karesi ve süre otomatik kayda girer', 'Banko bazlı haftalık uyum raporu'],
    kpis: [{ v: '60 sn', l: 'Sessiz alarm eşiği', c: C.amber }, { v: '2:18', l: 'Bugün en uzun sahipsiz süre', c: C.red }, { v: '3', l: 'İzlenen banko' }, { v: '7/24', l: 'Kesintisiz izleme', c: C.green }],
    frames: ['/images/banko-guvenligi/banko2.jpg', '/images/banko-guvenligi/banko3.jpg', '/images/banko-guvenligi/banko1.jpg'],
    shot: 'panel-nakit.jpg',
  },
  atm: {
    problem: 'ATM kabinleri gece saatlerinde savunmasız: saldırı aletleri, bırakılan şüpheli paketler, kabinde barınma ve vandalizm geç fark ediliyor.',
    how: ['Levye, matkap, sprey boya gibi saldırı araçlarının tespiti', 'Sahipsiz paket: belirlenen süre sonunda alarm', 'Kabinde uyuma / barınma tespiti', 'Kabin ve dış cephe kameralarından görüntülü bildirim'],
    kpis: [{ v: '6', l: 'İzlenen ATM', c: C.cyan }, { v: '3', l: 'Saldırı aracı tespiti (30g)', c: C.red }, { v: '7', l: 'Sahipsiz paket (30g)', c: C.amber }, { v: '12', l: 'Barınma / uyuma (30g)' }],
    frames: ['/images/atm-resimler/atm4.jpg', '/images/atm-resimler/atm3.jpg', '/images/atm-resimler/atm2.jpg'],
    shot: 'panel-atm.jpg',
  },
}

/* ---------------- ortak parçalar ---------------- */

function Eyebrow({ children, color = C.cyan }: { children: ReactNode; color?: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[15px] tracking-[0.22em] uppercase" style={{ color }}>
      <span className="h-px w-10" style={{ background: color }} />
      {children}
    </p>
  )
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('mt-5 text-[56px] leading-[1.05] font-semibold tracking-[-0.03em] text-white', className)}>{children}</h2>
}

function Glass({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn('rounded-[22px] border border-white/10 bg-white/[0.045] backdrop-blur-md', className)} style={style}>
      {children}
    </div>
  )
}

function Photo({ src, className, pos = 'center' }: { src: string; className?: string; pos?: string }) {
  return <img src={src} alt="" draggable={false} className={cn('object-cover', className)} style={{ objectPosition: pos }} />
}

/** Panel ekran görüntüsünü tarayıcı çerçevesinde gösterir */
function Screen({ src, className, url = 'panel.hypevision.com.tr' }: { src: string; className?: string; url?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-[18px] border border-white/12 bg-[#0d1424] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]', className)}>
      <div className="flex h-9 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4">
        <i className="size-2.5 rounded-full bg-[#ff5f57]" />
        <i className="size-2.5 rounded-full bg-[#febc2e]" />
        <i className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto rounded-md bg-white/[0.06] px-3 py-0.5 font-mono text-[11px] text-white/45">{url}</span>
      </div>
      <img src={SHOT + src} alt="" draggable={false} className="block w-full" />
    </div>
  )
}

function Footer({ n, section }: { n: number; section: string }) {
  return (
    <div className="absolute right-20 bottom-9 left-20 flex items-center justify-between text-[13px] text-white/40">
      <img src={brand.logoDark} alt={brand.name} className="h-[18px] opacity-70" />
      <span className="mr-[230px] font-mono tracking-[0.18em] uppercase">
        {section} <span className="text-white/25">· {String(n).padStart(2, '0')}</span>
      </span>
    </div>
  )
}

/** Tüm slaytların ortak kabı — arka plan görseli + koyu degrade */
function Frame({ children, bg, bgOpacity = 0.35, bgPos, overlay = 'side', glow = C.cyan }: { children: ReactNode; bg?: string; bgOpacity?: number; bgPos?: string; overlay?: 'side' | 'full' | 'bottom'; glow?: string }) {
  return (
    <div className="relative size-full overflow-hidden bg-[#070b14] text-white">
      {bg && <Photo src={bg} pos={bgPos} className="absolute inset-0 size-full" />}
      {bg && (
        <div
          className="absolute inset-0"
          style={{
            background:
              overlay === 'side'
                ? `linear-gradient(90deg, #070b14 0%, rgba(7,11,20,${1 - bgOpacity * 0.4}) 45%, rgba(7,11,20,${1 - bgOpacity}) 100%)`
                : overlay === 'bottom'
                  ? `linear-gradient(0deg, #070b14 8%, rgba(7,11,20,${1 - bgOpacity}) 70%)`
                  : `rgba(7,11,20,${1 - bgOpacity})`,
          }}
        />
      )}
      <div className="pointer-events-none absolute -top-60 -left-40 size-[700px] rounded-full opacity-[0.16] blur-[140px]" style={{ background: glow }} />
      <div className="pointer-events-none absolute -right-40 -bottom-72 size-[640px] rounded-full bg-[#8f7cf8] opacity-[0.1] blur-[140px]" />
      <div className="relative size-full">{children}</div>
    </div>
  )
}

/* ---------------- slaytlar ---------------- */

type SlideDef = { section: string; render: (n: number) => ReactNode }

function CoverSlide() {
  return (
    <Frame bg="/images/subeler/sube1.jpg" bgOpacity={0.55} overlay="side">
      <div className="flex h-full flex-col justify-between p-20">
        <img src={brand.logoDark} alt={brand.name} className="h-10 self-start" />
        <div className="max-w-[900px]">
          <Eyebrow>{brand.product}</Eyebrow>
          <h1 className="mt-7 text-[104px] leading-[0.98] font-semibold tracking-[-0.045em]">
            Görün.
            <br />
            Anlayın.
            <br />
            <span className="bg-gradient-to-r from-[#38d6ee] to-[#8f7cf8] bg-clip-text text-transparent">Önleyin.</span>
          </h1>
          <p className="mt-8 max-w-[720px] text-[24px] leading-[1.45] text-white/70">
            Şubelerdeki mevcut kameraları; dolandırıcılığı önleyen, kuyruğu ölçen ve ATM’yi gece de koruyan bir yapay zekâ ağına dönüştürüyoruz.
          </p>
        </div>
        <div className="flex items-end justify-between text-white/55">
          <div className="flex gap-10 text-[15px]">
            {[
              [`${modules.length}`, 'aktif AI modülü'],
              [`${branches.length}`, 'şube'],
              [`${totalCameras}`, 'kamera'],
              ['On-Premise', 'KVKK uyumlu'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-[30px] font-semibold text-white">{v}</p>
                <p>{l}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[14px] tracking-[0.18em] uppercase">Ekim 2026 · Yönetim Sunumu</p>
        </div>
      </div>
    </Frame>
  )
}

function AgendaSlide({ n }: { n: number }) {
  const items = [
    ['Neden şimdi?', 'Şubede bugün görünmeyen riskler'],
    ['Platform & mimari', 'Mevcut kameralardan on-premise yapay zekâya'],
    ['5 aktif modül', 'Dolandırıcılık, içgörü, operasyon, nakit, ATM'],
    ['Yönetim paneli', 'Alarm merkezi, kameralar, şubeler, yetkiler'],
    ['Katılan değer', 'KPI’lar ve önce / sonra karşılaştırması'],
    [`${extraModules.length} ek modül`, 'Genişleme yol haritası ve KPI hedefleri'],
  ]
  return (
    <Frame>
      <div className="grid h-full grid-cols-[1fr_620px] gap-16 p-20">
        <div>
          <Eyebrow>Gündem</Eyebrow>
          <Title>Bu sunumda</Title>
          <ol className="mt-12 space-y-3">
            {items.map(([t, d], i) => (
              <li key={t} className="flex items-center gap-6 border-b border-white/8 pb-4">
                <span className="w-12 font-mono text-[20px] text-[#38d6ee]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[27px] font-medium">{t}</span>
                <span className="ml-auto text-[17px] text-white/45">{d}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid grid-cols-2 grid-rows-3 gap-3 pb-12">
          {['/images/dolandiricilik/dolandir4.jpg', '/images/kameralar/beklemealani2.jpg', '/images/operasyonel/oper5.jpg', '/images/banko-guvenligi/banko5.jpg', '/images/atm-resimler/atm1.jpg', '/images/subeler/sube6.jpg'].map((s) => (
            <Photo key={s} src={s} className="size-full rounded-2xl border border-white/10" />
          ))}
        </div>
      </div>
      <Footer n={n} section="Gündem" />
    </Frame>
  )
}

function ProblemSlide({ n }: { n: number }) {
  const pains = [
    { icon: EyeOff, color: C.red, t: 'Kameralar kaydediyor, kimse izlemiyor', d: 'Bir şubede ortalama 11 kamera var; görüntüye ancak olaydan sonra, kayıt geriye sarılarak bakılıyor.' },
    { icon: Fingerprint, color: C.amber, t: 'Dolandırıcı tekrar geliyor', d: 'Kara listedeki kişi başka bir şubeye girdiğinde kimse bilmiyor; işlem tamamlanınca fark ediliyor.' },
    { icon: UsersRound, color: C.cyan, t: 'Kuyruk gözle yönetiliyor', d: 'Bekleme süresi, gişe doluluğu ve net müşteri sayısı ölçülmüyor; planlama tahmine dayanıyor.' },
    { icon: Building2, color: C.violet, t: 'ATM gece savunmasız', d: 'Saldırı aleti, şüpheli paket ve kabin vandalizmi sabah açılışta fark ediliyor.' },
  ]
  return (
    <Frame bg="/images/banko-guvenligi/banko5.jpg" bgOpacity={0.3} overlay="full" glow={C.red}>
      <div className="p-20">
        <Eyebrow color={C.red}>Neden şimdi?</Eyebrow>
        <Title className="max-w-[1100px]">Şubede her gün olan ama bugün görünmeyen dört risk</Title>
        <div className="mt-16 grid grid-cols-4 gap-5">
          {pains.map((p) => (
            <Glass key={p.t} className="p-8">
              <span className="flex size-14 items-center justify-center rounded-2xl" style={{ background: p.color + '22', color: p.color }}>
                <p.icon className="size-7" />
              </span>
              <p className="mt-7 text-[25px] leading-[1.2] font-semibold">{p.t}</p>
              <p className="mt-4 text-[17px] leading-[1.55] text-white/60">{p.d}</p>
            </Glass>
          ))}
        </div>
        <p className="mt-10 text-[22px] text-white/70">
          Ortak nokta: <span className="text-white">veri zaten kameralarda var</span> — eksik olan, onu anlık okuyan bir zekâ.
        </p>
      </div>
      <Footer n={n} section="Neden şimdi?" />
    </Frame>
  )
}

function SolutionSlide({ n }: { n: number }) {
  return (
    <Frame>
      <div className="grid h-full grid-cols-[1fr_1fr] gap-14 p-20">
        <div>
          <Eyebrow>Çözüm</Eyebrow>
          <Title>Tek platform, beş yapay zekâ modülü</Title>
          <p className="mt-6 text-[21px] leading-[1.55] text-white/65">
            {brand.name}, şubedeki mevcut IP kameralara bağlanır. Yeni kamera, kablo ya da bulut aboneliği gerekmez. Görüntü işleme bankanın kendi sunucusunda yapılır; panel, mobil bildirim ve raporlar
            tek yerden yönetilir.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: 'Güvenlik', d: 'Dolandırıcılık · Nakit · ATM', c: C.red },
              { v: 'Operasyon', d: 'Kuyruk · Gişe · SLA', c: C.cyan },
              { v: 'Müşteri', d: 'Sayım · Profil · Yoğunluk', c: C.violet },
            ].map((p) => (
              <Glass key={p.v} className="p-5">
                <span className="block h-1 w-10 rounded-full" style={{ background: p.c }} />
                <p className="mt-4 text-[22px] font-semibold">{p.v}</p>
                <p className="mt-1 text-[15px] text-white/50">{p.d}</p>
              </Glass>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 pb-14">
          {modules.map((m) => (
            <div key={m.key} className="relative flex flex-1 items-center gap-5 overflow-hidden rounded-2xl border border-white/10 pl-6">
              <Photo src={m.cover} className="absolute inset-0 size-full opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 to-transparent" />
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10" style={{ color: m.color }}>
                <m.icon className="size-6" />
              </span>
              <div className="relative">
                <p className="font-mono text-[12px] tracking-[0.16em] text-white/45">MODÜL {m.no}</p>
                <p className="text-[22px] font-semibold">{m.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer n={n} section="Platform" />
    </Frame>
  )
}

function ArchitectureSlide({ n }: { n: number }) {
  const steps = [
    { icon: Cctv, t: 'Mevcut IP kameralar', d: 'RTSP akışı · marka bağımsız (Hikvision, Axis, Dahua)', img: '/images/kameralar/giriskamerasi5.jpg' },
    { icon: ServerCog, t: 'On-Premise AI sunucusu', d: 'Şube / bölge bazlı GPU sunucu · görüntü bankadan çıkmaz', img: '/images/kameralar/beklemealani.jpg' },
    { icon: Workflow, t: 'Olay & kural motoru', d: 'Eşikler, zaman çizelgeleri, şube bazlı kurallar', img: '/images/operasyonel/oper4.jpg' },
    { icon: BellRing, t: 'Anlık bildirim', d: 'Panel pop-up · mobil · SMS · e-posta · görsel kanıt', img: '/images/dolandiricilik/dolandir1.jpg' },
    { icon: FileBarChart, t: 'Yönetim raporu', d: 'Şube → bölge → genel müdürlük günlük rapor', img: '/images/subeler/sube4.jpg' },
  ]
  return (
    <Frame>
      <div className="p-20">
        <Eyebrow>Nasıl çalışır?</Eyebrow>
        <Title>Kameradan karara, bir saniyenin altında</Title>
        <div className="mt-16 grid grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <div key={s.t} className="relative">
              <Glass className="overflow-hidden">
                <div className="relative h-[150px]">
                  <Photo src={s.img} className="size-full opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b111d] to-transparent" />
                  <span className="absolute bottom-3 left-5 font-mono text-[40px] font-semibold text-white/90">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="p-6 pt-4">
                  <s.icon className="size-7 text-[#38d6ee]" />
                  <p className="mt-3 text-[21px] leading-tight font-semibold">{s.t}</p>
                  <p className="mt-2 min-h-[72px] text-[15px] leading-[1.5] text-white/55">{s.d}</p>
                </div>
              </Glass>
              {i < steps.length - 1 && (
                <span className="absolute top-[200px] -right-[18px] z-10 flex size-8 items-center justify-center rounded-full border border-white/15 bg-[#0b111d] text-[#38d6ee]">
                  <ArrowRight className="size-4" />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-4 text-[17px]">
          {['Bulut bağımlılığı yok', 'Kurulum uzaktan · VPN üzerinden', 'Mevcut VMS ile yan yana çalışır', 'Yüz verisi şifreli vektör olarak tutulur'].map((t) => (
            <span key={t} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-white/75">
              <CircleCheck className="size-4.5 text-[#34d399]" /> {t}
            </span>
          ))}
        </div>
      </div>
      <Footer n={n} section="Mimari" />
    </Frame>
  )
}

function ModuleSlide({ n, k }: { n: number; k: ModuleKey }) {
  const m = modules.find((x) => x.key === k)!
  const d = moduleDeck[k]
  return (
    <Frame glow={m.color}>
      <div className="grid h-full grid-cols-[820px_1fr] grid-rows-[minmax(0,1fr)] gap-12 p-20 pb-28">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/10">
            <Photo src={d.frames[0]} className="absolute inset-0 size-full" />
          </div>
          <div className="grid h-[140px] shrink-0 grid-cols-3 grid-rows-1 gap-3">
            <Photo src={d.frames[1]} className="size-full rounded-2xl border border-white/10" />
            <Photo src={d.frames[2]} className="size-full rounded-2xl border border-white/10" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <Photo src={SHOT + d.shot} pos="left top" className="size-full" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pt-6 pb-2 text-[12px] text-white/80">Paneldeki görünüm</span>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06]" style={{ color: m.color }}>
              <m.icon className="size-6" />
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[13px] tracking-[0.16em] text-white/70">MODÜL {m.no}</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-3 py-1 text-[13px] text-[#34d399]">
              <span className="size-1.5 rounded-full bg-[#34d399]" /> Aktif
            </span>
          </div>
          <h2 className="mt-6 text-[46px] leading-[1.05] font-semibold tracking-[-0.03em]">{m.title}</h2>
          <p className="mt-1 text-[17px] text-white/45">{m.subtitle}</p>
          <p className="mt-6 border-l-2 pl-5 text-[18px] leading-[1.55] text-white/70" style={{ borderColor: m.color }}>
            <span className="font-semibold text-white">Sorun: </span>
            {d.problem}
          </p>
          <ul className="mt-6 space-y-2.5">
            {d.how.map((h) => (
              <li key={h} className="flex gap-3 text-[17px] leading-snug text-white/80">
                <CircleCheck className="mt-0.5 size-5 shrink-0" style={{ color: m.color }} /> {h}
              </li>
            ))}
          </ul>
          <div className="mt-auto grid grid-cols-2 gap-3">
            {d.kpis.map((kp) => (
              <Glass key={kp.l} className="px-5 py-4">
                <p className="text-[32px] font-semibold tracking-tight tabular-nums" style={{ color: kp.c ?? '#fff' }}>
                  {kp.v}
                </p>
                <p className="text-[14px] text-white/50">{kp.l}</p>
              </Glass>
            ))}
          </div>
        </div>
      </div>
      <Footer n={n} section={`Modül ${m.no}`} />
    </Frame>
  )
}

function PanelSlide({ n }: { n: number }) {
  const notes = [
    { t: 'Rol bazlı kapsam', d: 'Genel müdürlük tüm şubeleri, bölge müdürü kendi bölgesini, şube müdürü kendi şubesini görür.' },
    { t: 'Canlı KPI kartları', d: 'Net ziyaretçi, bekleme süresi, açık kritik alarm ve SLA tek bakışta.' },
    { t: 'Modül durumları', d: 'Her modülün son 24 saatteki olay sayısı ve yeni alarmlar.' },
    { t: 'Günlük rapor', d: 'Tek tıkla yönetim raporu PDF.' },
  ]
  return (
    <Frame>
      <div className="grid h-full grid-cols-[1fr_1040px] gap-12 p-20">
        <div>
          <Eyebrow>Yönetim paneli</Eyebrow>
          <Title className="text-[50px]">Tüm şubeler tek ekranda</Title>
          <div className="mt-10 space-y-6">
            {notes.map((x, i) => (
              <div key={x.t} className="flex gap-4">
                <span className="mt-1 font-mono text-[15px] text-[#38d6ee]">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-[21px] font-semibold">{x.t}</p>
                  <p className="mt-1 text-[16px] leading-[1.5] text-white/55">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Screen src="panel-genel-bakis.jpg" className="self-center" />
      </div>
      <Footer n={n} section="Panel" />
    </Frame>
  )
}

function AlarmSlide({ n }: { n: number }) {
  const flow = [
    { t: 'Tespit', d: 'Kamera karesi + güven skoru', c: C.red },
    { t: 'Bildirim', d: 'Pop-up · SMS · e-posta', c: C.amber },
    { t: 'İnceleme', d: 'Görsel kanıtla doğrulama', c: C.cyan },
    { t: 'Kapanış', d: 'Sonuç ve not kayda girer', c: C.green },
  ]
  return (
    <Frame>
      <div className="grid h-full grid-cols-[1000px_1fr] gap-12 p-20">
        <Screen src="panel-alarmlar.jpg" className="self-center" />
        <div className="flex flex-col">
          <Eyebrow color={C.red}>Alarm merkezi</Eyebrow>
          <Title className="text-[48px]">Her alarm görsel kanıtıyla gelir</Title>
          <p className="mt-5 text-[18px] leading-[1.55] text-white/60">
            Tüm modüllerin olayları tek listede: şube, kamera, önem derecesi ve durum filtresiyle. Yanlış alarmlar işaretlendikçe model şube özelinde iyileşir.
          </p>
          <div className="mt-8 space-y-3">
            {flow.map((f, i) => (
              <div key={f.t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5">
                <span className="flex size-9 items-center justify-center rounded-full font-mono text-[15px] font-semibold text-[#070b14]" style={{ background: f.c }}>
                  {i + 1}
                </span>
                <span className="text-[20px] font-semibold">{f.t}</span>
                <span className="ml-auto text-[15px] text-white/50">{f.d}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <Glass className="px-5 py-4">
              <p className="text-[34px] font-semibold text-[#34d399]">%5,7</p>
              <p className="text-[14px] text-white/50">Yanlış alarm oranı · hedef &lt; %5</p>
            </Glass>
            <Glass className="px-5 py-4">
              <p className="text-[34px] font-semibold">4 kanal</p>
              <p className="text-[14px] text-white/50">Panel · mobil · SMS · e-posta</p>
            </Glass>
          </div>
        </div>
      </div>
      <Footer n={n} section="Panel" />
    </Frame>
  )
}

function InfraSlide({ n }: { n: number }) {
  return (
    <Frame>
      <div className="p-20">
        <Eyebrow>Altyapı & yetkilendirme</Eyebrow>
        <Title>Kamera sağlığından kullanıcı yetkisine</Title>
        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { s: 'panel-kameralar.jpg', t: 'Kamera kalibrasyonu', d: 'Her kameranın yüz tanıma uygunluk skoru; açı, FPS, WDR ve shutter önerileri.' },
            { s: 'panel-subeler.jpg', t: 'Şube yaygınlaştırma', d: 'Pilot, kurulum ve planlanan şubeler; şube bazlı aksiyon planı ve ilerleme.' },
            { s: 'panel-yetkiler.jpg', t: 'Rol bazlı yetki (RBAC)', d: 'Genel müdürlük → bölge → şube → güvenlik birimi; bildirim kanalları kişi bazında.' },
          ].map((x) => (
            <div key={x.t}>
              <Screen src={x.s} url="panel" />
              <p className="mt-6 text-[23px] font-semibold">{x.t}</p>
              <p className="mt-2 text-[16px] leading-[1.5] text-white/55">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-4 gap-4">
          {[
            { v: `${totalCameras}`, l: 'kamera · 6 şube', c: C.cyan },
            { v: '%82', l: 'ortalama yüz tanıma uygunluğu', c: C.amber },
            { v: '16', l: 'otomatik kalibrasyon önerisi', c: C.violet },
            { v: '4', l: 'rol · genel müdürlükten güvenliğe', c: C.green },
          ].map((x) => (
            <Glass key={x.l} className="flex items-baseline gap-4 px-6 py-5">
              <span className="text-[40px] font-semibold tabular-nums" style={{ color: x.c }}>
                {x.v}
              </span>
              <span className="text-[16px] text-white/55">{x.l}</span>
            </Glass>
          ))}
        </div>
      </div>
      <Footer n={n} section="Panel" />
    </Frame>
  )
}

function ValueSlide({ n }: { n: number }) {
  const big = [
    { v: '1,4 sn', l: 'Kara liste eşleşmesinde uyarı süresi', c: C.cyan },
    { v: '−%12,4', l: 'Ortalama bekleme süresi', c: C.green },
    { v: '%94,1', l: 'SLA uyum oranı · hedef %92', c: C.violet },
    { v: '%99,3', l: 'Yüz tanıma doğruluğu', c: C.amber },
  ]
  const rows = [
    ['Dolandırıcı tespiti', 'İşlem sonrası, kayıttan', 'Girişte, işlemden önce'],
    ['Müşteri sayımı', 'Tahmini, personel dahil', 'Net, personelden ayrıştırılmış'],
    ['Kuyruk yönetimi', 'Gözle, şikâyet gelince', 'Dakikalık ölçüm, eşik uyarısı'],
    ['Sahipsiz nakit', 'Denetimde fark edilir', '60 sn’de sessiz alarm'],
    ['ATM saldırısı', 'Sabah açılışta', 'Anında, görüntülü'],
    ['Raporlama', 'Elle, haftalık', 'Otomatik, günlük'],
  ]
  return (
    <Frame glow={C.green}>
      <div className="p-20">
        <Eyebrow color={C.green}>Katılan değer</Eyebrow>
        <Title>Ölçülebilir sonuçlar</Title>
        <div className="mt-10 grid grid-cols-4 gap-4">
          {big.map((b) => (
            <Glass key={b.l} className="relative overflow-hidden p-7">
              <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${b.c}, transparent)` }} />
              <p className="text-[54px] leading-none font-semibold tracking-tight tabular-nums" style={{ color: b.c }}>
                {b.v}
              </p>
              <p className="mt-3 text-[16px] text-white/60">{b.l}</p>
            </Glass>
          ))}
        </div>
        <Glass className="mt-6 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/10 px-8 py-3.5 font-mono text-[13px] tracking-[0.16em] text-white/45 uppercase">
            <span>Konu</span>
            <span>Önce</span>
            <span className="text-[#34d399]">{brand.name} ile</span>
          </div>
          {rows.map(([a, b, c]) => (
            <div key={a} className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/6 px-8 py-[15px] text-[19px] last:border-0">
              <span className="font-medium">{a}</span>
              <span className="text-white/45 line-through decoration-white/20">{b}</span>
              <span className="flex items-center gap-2 text-white">
                <CircleCheck className="size-4.5 text-[#34d399]" />
                {c}
              </span>
            </div>
          ))}
        </Glass>
      </div>
      <Footer n={n} section="Katılan değer" />
    </Frame>
  )
}

function RolloutSlide({ n }: { n: number }) {
  const cls = { pilot: 'bg-[#34d399] text-[#062016]', kurulum: 'bg-[#f5b74a] text-[#2a1b02]', planlandi: 'bg-white/15 text-white' }
  return (
    <Frame>
      <div className="p-20">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>Yaygınlaştırma</Eyebrow>
            <Title>Pilottan altı şubeye</Title>
          </div>
          <div className="flex gap-10 pb-2 text-right">
            {[
              [totalCameras, 'kamera'],
              [totalAtms, 'ATM'],
              [totalCounters, 'gişe'],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-[44px] font-semibold tabular-nums">{v}</p>
                <p className="text-[15px] text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b.id} className="relative h-[250px] overflow-hidden rounded-[22px] border border-white/10">
              <Photo src={b.image} className="size-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/40 to-transparent" />
              <span className={cn('absolute top-4 left-4 rounded-full px-3 py-1 text-[13px] font-semibold', cls[b.status])}>{branchStatusLabel[b.status]}</span>
              <div className="absolute right-5 bottom-4 left-5 flex items-end justify-between">
                <div>
                  <p className="text-[24px] font-semibold">{b.name}</p>
                  <p className="text-[14px] text-white/55">{b.district}</p>
                </div>
                <p className="font-mono text-[14px] text-white/70">
                  {b.cameras} kam · {b.atms} ATM · {b.counters} gişe
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer n={n} section="Yaygınlaştırma" />
    </Frame>
  )
}

function DividerSlide({ n }: { n: number }) {
  return (
    <Frame bg="/images/kameralar/giriskamerasi2.jpg" bgOpacity={0.45} overlay="side" glow={C.violet}>
      <div className="flex h-full flex-col justify-center p-20">
        <Eyebrow color={C.violet}>Sırada ne var?</Eyebrow>
        <h2 className="mt-6 text-[96px] leading-[0.98] font-semibold tracking-[-0.045em]">
          Aynı kameralar.
          <br />
          <span className="bg-gradient-to-r from-[#8f7cf8] to-[#38d6ee] bg-clip-text text-transparent">{extraModules.length} yeni modül.</span>
        </h2>
        <p className="mt-8 max-w-[780px] text-[23px] leading-[1.5] text-white/70">
          Bugünkü kurulum, şube kameralarının yalnızca bir kısmını kullanıyor. Ek modüller aynı RTSP akışları ve aynı on-premise sunucu üzerinde çalışır — yeni kamera, kablo ya da bulut gerekmez.
        </p>
        <div className="mt-12 flex gap-4">
          {extraCategories.map((c) => (
            <Glass key={c.key} className="px-6 py-4">
              <p className="text-[34px] font-semibold">{extraModules.filter((m) => m.category === c.key).length}</p>
              <p className="text-[15px] text-white/60">{c.label}</p>
            </Glass>
          ))}
        </div>
      </div>
      <Footer n={n} section="Ek modüller" />
    </Frame>
  )
}

const catHex: Record<ExtraCategory, string> = { guvenlik: C.red, atm: C.amber, musteri: C.cyan, zeka: C.violet }

function ExtraSlide({ n, cats, title }: { n: number; cats: ExtraCategory[]; title: string }) {
  const list = extraModules.filter((m) => cats.includes(m.category))
  const cols = list.length <= 3 ? list.length : list.length === 4 ? 4 : 5
  return (
    <Frame glow={catHex[cats[0]]}>
      <div className="flex h-full flex-col p-20 pb-24">
        <Eyebrow color={catHex[cats[0]]}>Ek modüller · {cats.map((c) => extraCategories.find((x) => x.key === c)!.label).join(' & ')}</Eyebrow>
        <Title className="text-[50px]">{title}</Title>
        <div className="mt-10 grid min-h-0 flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {list.map((m) => {
            const color = catHex[m.category]
            return (
              <Glass key={m.key} className="flex min-h-0 flex-col overflow-hidden">
                <div className={cn('relative shrink-0', cols >= 5 ? 'h-[170px]' : 'h-[200px]')}>
                  <Photo src={m.image} className="size-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b111d] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[12px] backdrop-blur">M{m.no}</span>
                  <span className="absolute top-3 right-3 rounded-full bg-white/15 px-2.5 py-1 text-[12px] backdrop-blur">Faz {m.phase}</span>
                  <span className="absolute bottom-3 left-4 flex size-10 items-center justify-center rounded-xl border border-white/15 bg-black/40 backdrop-blur" style={{ color }}>
                    <m.icon className="size-5" />
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-5">
                  <p className={cn('leading-tight font-semibold', cols >= 5 ? 'text-[19px]' : 'text-[22px]')}>{m.title}</p>
                  <p className={cn('mt-2.5 leading-[1.5] text-white/55', cols >= 5 ? 'line-clamp-8 text-[14px]' : 'line-clamp-6 text-[15.5px]')}>{m.description}</p>
                  <div className="mt-auto space-y-2 pt-4">
                    {m.kpis.map((k) => (
                      <div key={k.label} className="flex items-baseline justify-between gap-3 border-t border-white/8 pt-2">
                        <span className={cn('text-white/50', cols >= 5 ? 'text-[13px]' : 'text-[14px]')}>{k.label}</span>
                        <span className={cn('shrink-0 font-semibold', cols >= 5 ? 'text-[17px]' : 'text-[19px]')} style={{ color }}>
                          {k.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Glass>
            )
          })}
        </div>
      </div>
      <Footer n={n} section="Ek modüller" />
    </Frame>
  )
}

function KpiMatrixSlide({ n }: { n: number }) {
  const cols = extraModules.map((m) => m.no)
  return (
    <Frame glow={C.violet}>
      <div className="p-20">
        <Eyebrow color={C.violet}>KPI etki matrisi</Eyebrow>
        <Title className="text-[50px]">Hangi modül hangi KPI’ı hareket ettiriyor?</Title>
        <Glass className="mt-10 overflow-hidden">
          <div className="grid border-b border-white/10 px-6 py-3 font-mono text-[12px] text-white/45" style={{ gridTemplateColumns: `300px 220px repeat(${cols.length}, 1fr)` }}>
            <span className="tracking-[0.14em] uppercase">KPI</span>
            <span className="tracking-[0.14em] uppercase">Hedef</span>
            {cols.map((c) => (
              <span key={c} className="text-center">
                M{c}
              </span>
            ))}
          </div>
          {extraKpiImpact.map((k) => (
            <div key={k.label} className="grid items-center border-b border-white/6 px-6 py-[22px] last:border-0" style={{ gridTemplateColumns: `300px 220px repeat(${cols.length}, 1fr)` }}>
              <span className="text-[21px] font-medium">{k.label}</span>
              <span className="text-[20px] font-semibold text-[#38d6ee]">{k.target}</span>
              {cols.map((c) => {
                const m = extraModules.find((x) => x.no === c)!
                const on = k.modules.includes(c)
                return (
                  <span key={c} className="flex justify-center">
                    <span className={cn('size-5 rounded-full', !on && 'border border-white/10')} style={on ? { background: catHex[m.category], boxShadow: `0 0 14px ${catHex[m.category]}` } : undefined} />
                  </span>
                )
              })}
            </div>
          ))}
        </Glass>
        <div className="mt-6 flex items-center gap-6 text-[15px] text-white/55">
          {extraCategories.map((c) => (
            <span key={c.key} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ background: catHex[c.key] }} /> {c.label}
            </span>
          ))}
          <span className="ml-auto">Değerler hedef aralıklardır; pilot şubede ölçülerek kesinleşir.</span>
        </div>
      </div>
      <Footer n={n} section="KPI" />
    </Frame>
  )
}

function RoadmapSlide({ n }: { n: number }) {
  return (
    <Frame>
      <div className="p-20">
        <Eyebrow>Yol haritası</Eyebrow>
        <Title>180 günde akıllı şube</Title>
        <div className="relative mt-14 grid grid-cols-3 gap-6">
          <div className="absolute top-[22px] right-0 left-0 h-px bg-gradient-to-r from-[#38d6ee] via-[#8f7cf8] to-[#f2556b] opacity-60" />
          {extraPhases.map((p, i) => {
            const color = [C.cyan, C.violet, C.red][i]
            return (
              <div key={p.no} className="relative">
                <span className="relative z-10 flex size-11 items-center justify-center rounded-full border-2 bg-[#070b14] font-mono text-[17px] font-semibold" style={{ borderColor: color, color }}>
                  {p.no}
                </span>
                <p className="mt-6 font-mono text-[15px] tracking-[0.14em]" style={{ color }}>
                  {p.range}
                </p>
                <p className="mt-1 text-[30px] font-semibold">{p.title}</p>
                <p className="mt-2 min-h-[48px] text-[16px] text-white/55">{p.note}</p>
                <div className="mt-5 space-y-2">
                  {extraModules
                    .filter((m) => m.phase === p.no)
                    .map((m) => (
                      <div key={m.key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
                        <m.icon className="size-4.5 shrink-0" style={{ color: catHex[m.category] }} />
                        <span className="truncate text-[16.5px]">{m.title}</span>
                        <span className="ml-auto shrink-0 font-mono text-[12px] text-white/40">{m.weeks}</span>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <Footer n={n} section="Yol haritası" />
    </Frame>
  )
}

function PrivacySlide({ n }: { n: number }) {
  const items = [
    { icon: ServerCog, t: 'On-premise işleme', d: 'Görüntü işleme bankanın kendi sunucusunda; görüntü dışarı çıkmaz, bulut kullanılmaz.' },
    { icon: EyeOff, t: 'Anonim analiz', d: 'Sayım ve demografi anonimdir; yüz görüntüsü saklanmaz, yalnızca sayısal sonuç tutulur.' },
    { icon: Lock, t: 'Şifreli kara liste', d: 'Kara liste yüzleri geri döndürülemez vektörler olarak, şifreli tutulur; isimler maskelenir.' },
    { icon: ShieldCheck, t: 'Rol bazlı erişim', d: 'Herkes yalnızca yetkili olduğu şubeyi görür; her görüntüleme ve işlem loglanır.' },
    { icon: Cpu, t: 'Marka bağımsız', d: 'Hikvision, Axis, Dahua ve RTSP destekleyen tüm IP kameralarla çalışır.' },
    { icon: MonitorSmartphone, t: 'Mevcut sistemlerle', d: 'VMS, alarm paneli ve SOC ile yan yana; mevcut süreçler değişmez.' },
  ]
  return (
    <Frame bg="/images/kameralar/beklemealani2.jpg" bgOpacity={0.22} overlay="full" glow={C.green}>
      <div className="p-20">
        <Eyebrow color={C.green}>KVKK & bilgi güvenliği</Eyebrow>
        <Title>Veri bankadan çıkmaz</Title>
        <div className="mt-12 grid grid-cols-3 gap-5">
          {items.map((x) => (
            <Glass key={x.t} className="p-7">
              <x.icon className="size-8 text-[#34d399]" />
              <p className="mt-5 text-[23px] font-semibold">{x.t}</p>
              <p className="mt-2 text-[16px] leading-[1.55] text-white/60">{x.d}</p>
            </Glass>
          ))}
        </div>
      </div>
      <Footer n={n} section="KVKK" />
    </Frame>
  )
}

function ClosingSlide() {
  return (
    <Frame bg="/images/subeler/sube6.jpg" bgOpacity={0.5} overlay="side">
      <div className="flex h-full flex-col justify-between p-20">
        <img src={brand.logoDark} alt={brand.name} className="h-10 self-start" />
        <div>
          <Eyebrow>Sonraki adım</Eyebrow>
          <h2 className="mt-6 max-w-[1000px] text-[84px] leading-[1] font-semibold tracking-[-0.04em]">
            Pilot şubede 30 günde <span className="bg-gradient-to-r from-[#38d6ee] to-[#8f7cf8] bg-clip-text text-transparent">ölçelim.</span>
          </h2>
          <div className="mt-10 flex gap-4">
            {['Kamera keşfi & kalibrasyon', 'Faz 1 modüllerini devreye alma', 'KPI ölçümü & yönetim raporu'].map((t, i) => (
              <Glass key={t} className="flex items-center gap-4 px-6 py-4">
                <span className="font-mono text-[18px] text-[#38d6ee]">{i + 1}</span>
                <span className="text-[19px]">{t}</span>
              </Glass>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between text-[17px] text-white/60">
          <p className="text-[26px] font-medium text-white">{brand.slogan}</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <Smartphone className="size-4.5" /> {brand.website}
            </span>
            <span>{brand.support}</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

const slides: SlideDef[] = [
  { section: 'Kapak', render: () => <CoverSlide /> },
  { section: 'Gündem', render: (n) => <AgendaSlide n={n} /> },
  { section: 'Neden şimdi?', render: (n) => <ProblemSlide n={n} /> },
  { section: 'Platform', render: (n) => <SolutionSlide n={n} /> },
  { section: 'Mimari', render: (n) => <ArchitectureSlide n={n} /> },
  ...modules.map((m) => ({ section: `Modül ${m.no}`, render: (n: number) => <ModuleSlide n={n} k={m.key} /> })),
  { section: 'Panel', render: (n) => <PanelSlide n={n} /> },
  { section: 'Alarm merkezi', render: (n) => <AlarmSlide n={n} /> },
  { section: 'Altyapı', render: (n) => <InfraSlide n={n} /> },
  { section: 'Katılan değer', render: (n) => <ValueSlide n={n} /> },
  { section: 'Yaygınlaştırma', render: (n) => <RolloutSlide n={n} /> },
  { section: 'Ek modüller', render: (n) => <DividerSlide n={n} /> },
  { section: 'Fiziksel güvenlik', render: (n) => <ExtraSlide n={n} cats={['guvenlik']} title="Şubede ikinci savunma hattı" /> },
  { section: 'ATM & altyapı', render: (n) => <ExtraSlide n={n} cats={['atm', 'zeka']} title="ATM, kamera sağlığı ve yönetim zekâsı" /> },
  { section: 'Müşteri & operasyon', render: (n) => <ExtraSlide n={n} cats={['musteri']} title="Daha kısa bekleme, daha akıllı şube" /> },
  { section: 'KPI matrisi', render: (n) => <KpiMatrixSlide n={n} /> },
  { section: 'Yol haritası', render: (n) => <RoadmapSlide n={n} /> },
  { section: 'KVKK', render: (n) => <PrivacySlide n={n} /> },
  { section: 'Kapanış', render: () => <ClosingSlide /> },
]

/* ---------------- sahne & gezinme ---------------- */

const readHash = () => {
  const v = parseInt(window.location.hash.slice(1), 10)
  return Number.isFinite(v) ? Math.min(Math.max(v - 1, 0), slides.length - 1) : 0
}

export function PresentationPage() {
  const [index, setIndex] = useState(readHash)
  const [scale, setScale] = useState(1)
  const [stacked, setStacked] = useState(false)
  const [overview, setOverview] = useState(false)
  const touch = useRef<number | null>(null)

  const go = useCallback((i: number) => setIndex(Math.min(Math.max(i, 0), slides.length - 1)), [])

  useEffect(() => {
    document.title = `${brand.name} · Sunum`
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    const fit = () => {
      const narrow = window.innerWidth < 820 || (window.innerHeight > window.innerWidth && window.innerWidth < 1100)
      setStacked(narrow)
      setScale(narrow ? window.innerWidth / W : Math.min(window.innerWidth / W, (window.innerHeight - 0) / H))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    if (!stacked) history.replaceState(null, '', `#${index + 1}`)
  }, [index, stacked])

  useEffect(() => {
    const onHash = () => go(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [go])

  useEffect(() => {
    if (stacked) return
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) go(index + 1)
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) go(index - 1)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(slides.length - 1)
      else if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      } else if (e.key.toLowerCase() === 'o' || e.key === 'Escape') setOverview((o) => (e.key === 'Escape' ? false : !o))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go, stacked])

  if (stacked) {
    return (
      <div className="min-h-svh bg-[#070b14]">
        {slides.map((s, i) => (
          <div key={i} id={String(i + 1)} style={{ height: H * scale }} className="relative overflow-hidden border-b border-white/10">
            <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{s.render(i + 1)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="relative h-svh w-screen overflow-hidden bg-[#03060c] select-none"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
        touch.current = null
      }}
    >
      <div className="absolute top-1/2 left-1/2" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div key={index} className="size-full animate-in duration-500 fade-in">
          {slides[index].render(index + 1)}
        </div>
      </div>

      {/* ilerleme çubuğu */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/5">
        <div className="h-full bg-gradient-to-r from-[#38d6ee] to-[#8f7cf8] transition-all duration-500" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
      </div>

      {/* kontroller */}
      <div className="group absolute right-4 bottom-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1 text-white/70 opacity-40 backdrop-blur transition hover:opacity-100">
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => go(index - 1)} aria-label="Önceki">
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-14 text-center font-mono text-xs tabular-nums">
          {index + 1} / {slides.length}
        </span>
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => go(index + 1)} aria-label="Sonraki">
          <ChevronRight className="size-4" />
        </button>
        <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setOverview(true)} aria-label="Tüm slaytlar (O)">
          <Grid3x3 className="size-4" />
        </button>
        <button
          className="rounded-full p-2 hover:bg-white/10"
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}
          aria-label="Tam ekran (F)"
        >
          <Maximize className="size-4" />
        </button>
      </div>

      {/* genel görünüm */}
      {overview && (
        <div className="absolute inset-0 z-50 overflow-y-auto bg-[#03060c]/95 p-8 backdrop-blur animate-in fade-in">
          <div className="mb-6 flex items-center justify-between text-white">
            <img src={brand.logoDark} alt={brand.name} className="h-6" />
            <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setOverview(false)} aria-label="Kapat">
              <X className="size-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {slides.map((s, i) => {
              const thumb = 360 / W
              return (
                <button
                  key={i}
                  onClick={() => {
                    go(i)
                    setOverview(false)
                  }}
                  className={cn('text-left', i === index && 'ring-2 ring-[#38d6ee]', 'overflow-hidden rounded-xl border border-white/10 transition hover:-translate-y-0.5')}
                >
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
                    <div className="pointer-events-none absolute top-0 left-0" style={{ width: W, height: H, transform: `scale(${thumb})`, transformOrigin: 'top left' }}>
                      {s.render(i + 1)}
                    </div>
                  </div>
                  <p className="flex justify-between bg-white/5 px-3 py-2 text-xs text-white/70">
                    <span>{s.section}</span>
                    <span className="font-mono">{i + 1}</span>
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
