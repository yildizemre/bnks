import type { LucideIcon } from 'lucide-react'
import { Banknote, Clock4, ScanFace, ShieldAlert, UsersRound } from 'lucide-react'

export type ModuleKey = 'fraud' | 'insight' | 'operations' | 'cash' | 'atm'

export interface ModuleMeta {
  key: ModuleKey
  no: number
  title: string
  subtitle: string
  description: string
  path: string
  icon: LucideIcon
  /** Modül sayfasının üst banner görseli */
  cover: string
  color: string
}

export const modules: ModuleMeta[] = [
  {
    key: 'fraud',
    no: 1,
    title: 'Dolandırıcılık Önleme',
    subtitle: 'Fraud Prevention · Yüz Tanıma Ağı',
    description: 'Kara listedeki kişiler şubeye girdiği anda, henüz işlem yapmadan güvenlik birimine ve şube müdürüne anlık uyarı.',
    path: '/moduller/dolandiricilik-onleme',
    icon: ScanFace,
    cover: '/images/dolandiricilik/dolandir4.jpg',
    color: 'var(--chart-4)',
  },
  {
    key: 'insight',
    no: 2,
    title: 'Müşteri İçgörüsü',
    subtitle: 'Customer Insight',
    description: 'Personelden ayrıştırılmış net ziyaretçi sayımı, yaş aralığı ve cinsiyet dağılımı.',
    path: '/moduller/musteri-icgorusu',
    icon: UsersRound,
    cover: '/images/kameralar/beklemealani1.jpg',
    color: 'var(--chart-2)',
  },
  {
    key: 'operations',
    no: 3,
    title: 'Operasyonel Verimlilik',
    subtitle: 'Operational Efficiency',
    description: 'Kuyruk ve bekleme analizi, KPI eşiği aşımında uyarı, gişe etkileşim süresi ve SLA takibi.',
    path: '/moduller/operasyonel-verimlilik',
    icon: Clock4,
    cover: '/images/operasyonel/oper5.jpg',
    color: 'var(--chart-1)',
  },
  {
    key: 'cash',
    no: 4,
    title: 'Nakit ve Banko Güvenliği',
    subtitle: 'Cash Security',
    description: 'Banko üzerinde belirli süreden fazla sahipsiz kalan nakit için sessiz alarm.',
    path: '/moduller/nakit-guvenligi',
    icon: Banknote,
    cover: '/images/banko-guvenligi/banko3.jpg',
    color: 'var(--chart-3)',
  },
  {
    key: 'atm',
    no: 5,
    title: 'ATM ve Nesne Güvenliği',
    subtitle: 'ATM & Object Security',
    description: 'Sahipsiz paket, saldırı aracı (levye, matkap, sprey boya…) ve ATM kabininde barınma tespiti.',
    path: '/moduller/atm-guvenligi',
    icon: ShieldAlert,
    cover: '/images/atm-resimler/atm4.jpg',
    color: 'var(--chart-5)',
  },
]

export const moduleByKey = (key: ModuleKey) => modules.find((m) => m.key === key)!
