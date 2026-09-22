import { seeded } from '@/lib/format'
import { branches } from './branches'

/**
 * Tüm grafik/KPI verileri burada üretilir. Backend bağlandığında bu dosyadaki
 * fonksiyonlar API çağrılarıyla değiştirilecek; sayfalar aynı şekilleri bekler.
 * `f` = şube kapsam katsayısı (ScopeProvider.factor)
 */

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const traffic = [42, 88, 121, 164, 138, 117, 132, 149, 96, 38]
const staffTraffic = [18, 9, 7, 14, 21, 8, 6, 9, 12, 20]

export const hourlyTraffic = (f: number) =>
  HOURS.map((hour, i) => ({ hour, musteri: Math.round(traffic[i] * f), personel: Math.round(staffTraffic[i] * Math.max(1, f * 0.8)) }))

export const weeklyVisitors = (f: number) =>
  ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day, i) => ({
    day,
    buHafta: Math.round([1180, 1042, 1096, 1134, 1284, 512][i] * f),
    gecenHafta: Math.round([1090, 1010, 1122, 1051, 1190, 540][i] * f),
  }))

export const ageDistribution = (f: number) =>
  [
    { range: '18-24', kadin: 64, erkek: 78 },
    { range: '25-34', kadin: 142, erkek: 171 },
    { range: '35-44', kadin: 156, erkek: 188 },
    { range: '45-54', kadin: 118, erkek: 134 },
    { range: '55-64', kadin: 76, erkek: 92 },
    { range: '65+', kadin: 41, erkek: 52 },
  ].map((r) => ({ ...r, kadin: Math.round(r.kadin * f), erkek: Math.round(r.erkek * f) }))

export const waitByHour = (f: number) => {
  const base = [3.2, 5.8, 8.4, 12.6, 11.1, 7.9, 8.8, 10.7, 6.1, 2.9]
  return HOURS.map((hour, i) => ({ hour, bekleme: +(base[i] * (0.85 + Math.min(f, 2) * 0.15)).toFixed(1), hizmet: +(4 + (i % 3) * 0.6).toFixed(1) }))
}

export const WAIT_KPI_MINUTES = 10

export const counters = [
  { no: 1, staff: 'Elif Y.', type: 'Bireysel', transactions: 46, avgService: 262, sla: 97.8, status: 'aktif' as const },
  { no: 2, staff: 'Burak T.', type: 'Bireysel', transactions: 41, avgService: 298, sla: 95.1, status: 'aktif' as const },
  { no: 3, staff: '—', type: 'Bireysel', transactions: 18, avgService: 311, sla: 88.4, status: 'bos' as const },
  { no: 4, staff: 'Seda K.', type: 'Ticari', transactions: 27, avgService: 486, sla: 92.3, status: 'aktif' as const },
  { no: 5, staff: 'Onur A.', type: 'Vezne', transactions: 63, avgService: 174, sla: 98.9, status: 'aktif' as const },
  { no: 6, staff: 'Deniz Ç.', type: 'Vezne', transactions: 58, avgService: 189, sla: 96.2, status: 'mola' as const },
]

export const cashEvents = (f: number) =>
  ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day, i) => ({ day, olay: Math.round([3, 1, 4, 2, 5, 1][i] * Math.max(1, f)) }))

export const cashDesks = [
  { id: 'BNK-1', name: 'Banko 1 · Vezne', camera: 'KAM-09', exposedToday: 2, maxSeconds: 74, lastEvent: '11:42', image: '/images/banko-guvenligi/banko1.jpg' },
  { id: 'BNK-2', name: 'Banko 2 · Vezne', camera: 'KAM-10', exposedToday: 4, maxSeconds: 138, lastEvent: '14:05', image: '/images/banko-guvenligi/banko2.jpg' },
  { id: 'BNK-3', name: 'Banko 3 · Ticari', camera: 'KAM-11', exposedToday: 0, maxSeconds: 0, lastEvent: '—', image: '/images/banko-guvenligi/banko3.jpg' },
]

export const atmUnits = [
  { id: 'ATM-01', branchId: 'atasehir', location: 'Ataşehir · Dış Cephe', status: 'normal' as const, events: 1, lastEvent: 'Dün 23:14', image: '/images/atm-resimler/atm1.jpg' },
  { id: 'ATM-02', branchId: 'atasehir', location: 'Ataşehir · Kabin', status: 'uyari' as const, events: 3, lastEvent: '02:37', image: '/images/atm-resimler/atm4.jpg' },
  { id: 'ATM-03', branchId: 'atasehir', location: 'Ataşehir · Kabin', status: 'normal' as const, events: 0, lastEvent: '—', image: '/images/atm-resimler/atm3.jpg' },
  { id: 'ATM-04', branchId: 'kadikoy', location: 'Kadıköy · Dış Cephe', status: 'alarm' as const, events: 2, lastEvent: '04:12', image: '/images/atm-resimler/atm2.jpg' },
  { id: 'ATM-05', branchId: 'kadikoy', location: 'Kadıköy · Kabin', status: 'normal' as const, events: 0, lastEvent: '—', image: '/images/atm-resimler/atm5.jpg' },
  { id: 'ATM-06', branchId: 'umraniye', location: 'Ümraniye · Dış Cephe', status: 'normal' as const, events: 1, lastEvent: 'Dün 21:50', image: '/images/atm-resimler/atm1.jpg' },
]

export const atmThreatMix = [
  { key: 'paket', label: 'Sahipsiz Paket', value: 7 },
  { key: 'arac', label: 'Saldırı Aracı', value: 3 },
  { key: 'barinma', label: 'Barınma / Uyuma', value: 12 },
]

export interface BlacklistPerson {
  id: string
  alias: string
  category: 'Sahte Kimlik' | 'Dolandırıcılık Geçmişi' | 'Riskli Kişi'
  addedAt: string
  addedBy: string
  matches: number
  lastSeen: string
  photo: string
}

export const blacklist: BlacklistPerson[] = [
  { id: 'KL-0192', alias: 'K*** Y***', category: 'Sahte Kimlik', addedAt: '12.08.2026', addedBy: 'Genel Müdürlük', matches: 3, lastSeen: 'Bugün 10:14', photo: '/images/blacklist/person-1.jpg' },
  { id: 'KL-0187', alias: 'M*** A***', category: 'Dolandırıcılık Geçmişi', addedAt: '02.08.2026', addedBy: 'Anadolu 1. Bölge', matches: 2, lastSeen: 'Bugün 09:14', photo: '/images/blacklist/person-2.jpg' },
  { id: 'KL-0176', alias: 'S*** D***', category: 'Riskli Kişi', addedAt: '21.07.2026', addedBy: 'Genel Müdürlük', matches: 2, lastSeen: '18.09.2026', photo: '/images/blacklist/person-3.jpg' },
  { id: 'KL-0161', alias: 'H*** K***', category: 'Sahte Kimlik', addedAt: '05.07.2026', addedBy: 'Güvenlik Birimi', matches: 0, lastSeen: '—', photo: '/images/blacklist/person-4.jpg' },
  { id: 'KL-0158', alias: 'E*** B***', category: 'Dolandırıcılık Geçmişi', addedAt: '28.06.2026', addedBy: 'Genel Müdürlük', matches: 4, lastSeen: '14.09.2026', photo: '/images/blacklist/person-5.jpg' },
  { id: 'KL-0144', alias: 'T*** Ö***', category: 'Riskli Kişi', addedAt: '11.06.2026', addedBy: 'Anadolu 2. Bölge', matches: 0, lastSeen: '—', photo: '/images/blacklist/person-6.jpg' },
]

export interface CameraInfo {
  id: string
  branchId: string
  name: string
  zone: 'Giriş' | 'Bekleme' | 'Gişe' | 'Banko' | 'ATM'
  model: string
  resolution: string
  fps: number
  bitrate: number
  online: boolean
  /** Faz 1: Yüz tanıma standardına uygunluk skoru (0-100) */
  faceScore: number
  modules: string[]
  recommendation?: string
  image: string
}

const K = '/images/kameralar/'
const girisKareleri = [K + 'giriskamerasi.jpg', K + 'giriskamerasi2.jpg', K + 'giriskamerasi4.jpg', K + 'giriskamerasi5.jpg', K + 'giriskamera3.jpg']
const beklemeKareleri = [K + 'beklemealani.jpg', K + 'beklemealani1.jpg']

/** Her kamera türü için kare havuzu; şubeler havuzdan sırayla farklı kare alır */
const camTemplates: (Omit<CameraInfo, 'id' | 'branchId' | 'online' | 'faceScore' | 'image'> & { images: string[] })[] = [
  { name: 'Giriş Kapısı', zone: 'Giriş', model: 'Hikvision DS-2CD2386G2', resolution: '3840×2160', fps: 25, bitrate: 8192, modules: ['M1', 'M2'], images: girisKareleri },
  { name: 'Giriş İç Açı', zone: 'Giriş', model: 'Axis P3265-LVE', resolution: '1920×1080', fps: 25, bitrate: 4096, modules: ['M1', 'M2'], recommendation: 'Kamera açısı 12° aşağı indirilmeli; yüz yüksekliği hedef piksel altında.', images: [...girisKareleri.slice(2), ...girisKareleri.slice(0, 2)] },
  { name: 'Bekleme Salonu', zone: 'Bekleme', model: 'Dahua IPC-HDW3849H', resolution: '3840×2160', fps: 20, bitrate: 6144, modules: ['M2', 'M3', 'M5'], images: beklemeKareleri },
  { name: 'Gişe Önü Kuyruk', zone: 'Gişe', model: 'Hikvision DS-2CD2146G2', resolution: '2688×1520', fps: 15, bitrate: 3072, modules: ['M3'], recommendation: 'FPS 15 → 25 önerilir; kuyruk takibinde kayıp kareler var.', images: ['/images/operasyonel/oper1.jpg', '/images/operasyonel/oper4.jpg'] },
  { name: 'Gişe 1-3', zone: 'Gişe', model: 'Axis M3106-L', resolution: '2304×1728', fps: 25, bitrate: 4096, modules: ['M3'], images: ['/images/operasyonel/oper5.jpg', '/images/operasyonel/oper2.jpg', '/images/operasyonel/oper3.jpg'] },
  { name: 'Banko Vezne', zone: 'Banko', model: 'Hikvision DS-2CD2T47G2', resolution: '2688×1520', fps: 25, bitrate: 4096, modules: ['M4'], recommendation: 'Arka ışık (WDR) açılmalı; banko yüzeyinde parlama var.', images: [1, 2, 3, 4, 5].map((n) => `/images/banko-guvenligi/banko${n}.jpg`) },
  { name: 'ATM Kabini', zone: 'ATM', model: 'Dahua IPC-HFW2441S', resolution: '2688×1520', fps: 20, bitrate: 3072, modules: ['M5'], images: ['/images/atm-resimler/atm3.jpg', '/images/atm-resimler/atm5.jpg', '/images/atm-resimler/atm4.jpg'] },
  { name: 'ATM Dış Cephe', zone: 'ATM', model: 'Axis Q1798-LE', resolution: '3840×2160', fps: 25, bitrate: 8192, modules: ['M5'], recommendation: 'Gece modu shutter 1/30 → 1/60; hareket bulanıklığı var.', images: ['/images/atm-resimler/atm1.jpg', '/images/atm-resimler/atm2.jpg'] },
]

export const cameras: CameraInfo[] = branches.flatMap((b, bi) => {
  const rand = seeded(100 + bi)
  const count = b.status === 'planlandi' ? 4 : camTemplates.length
  return camTemplates.slice(0, count).map(({ images, ...t }, i) => ({
    ...t,
    id: `${b.id.slice(0, 3).toUpperCase()}-KAM-${String(i + 1).padStart(2, '0')}`,
    branchId: b.id,
    online: b.status === 'planlandi' ? false : rand() > 0.08,
    faceScore: t.recommendation ? Math.round(58 + rand() * 18) : Math.round(86 + rand() * 13),
    image: images[bi % images.length],
  }))
})
