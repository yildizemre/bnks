import { seeded } from '@/lib/format'
import { branches } from './branches'
import type { ModuleKey } from './modules'

export type Severity = 'kritik' | 'yuksek' | 'orta' | 'dusuk'
export type AlarmStatus = 'yeni' | 'inceleniyor' | 'kapandi' | 'yanlis'

export interface Alarm {
  id: string
  module: ModuleKey
  type: string
  title: string
  description: string
  severity: Severity
  branchId: string
  camera: string
  time: Date
  /** Olay anındaki kamera karesi — public/images/alarms/ altına koyun */
  image: string
  /** Kara liste eşleşmelerinde referans fotoğraf */
  referenceImage?: string
  confidence: number
  status: AlarmStatus
  read: boolean
}

interface AlarmTemplate {
  module: ModuleKey
  type: string
  title: string
  description: string
  severity: Severity
  camera: string
  images: string[]
  reference?: string[]
  /** Karede yazan sabit eşleşme oranı (0-1); yoksa rastgele üretilir */
  confidence?: number
  weight: number
}

/**
 * Bildirim şablonları. Her şablonun `images` listesi bildirimde gösterilecek
 * kareleri belirler; her modülün kareleri `public/images/<modül-klasörü>/` altındadır.
 */
export const alarmTemplates: AlarmTemplate[] = [
  // Dolandırıcılık kareleri: public/images/dolandiricilik/ (her kare kendi kara liste kaydına bağlı).
  // Referans fotoğrafı yalnızca karede kara liste kartı olmayanlarda gösterilir.
  {
    module: 'fraud',
    type: 'Kara Liste Eşleşmesi',
    title: 'KL-0192 şubeye giriş yaptı · Sahte Kimlik',
    description: 'Yüz tanıma ağı, sahte kimlik kaydı bulunan KL-0192 numaralı kişiyi giriş kapısında henüz işlem yapmadan tespit etti. Güvenlik birimine bildirildi.',
    severity: 'kritik',
    camera: 'Giriş · KAM-01',
    images: ['/images/dolandiricilik/dolandir1.jpg'],
    confidence: 0.991,
    weight: 0.5,
  },
  {
    module: 'fraud',
    type: 'Kara Liste Eşleşmesi',
    title: 'KL-0187 lobide tespit edildi · Dolandırıcılık Geçmişi',
    description: 'Dolandırıcılık geçmişi kaydı bulunan KL-0187 numaralı kişi lobi giriş kapısından geçti. Güvenlik birimine ve şube müdürüne pop-up alarm iletildi.',
    severity: 'kritik',
    camera: 'Lobi Giriş Kapısı · KAM-01',
    images: ['/images/dolandiricilik/dolandir2.jpg'],
    confidence: 0.987,
    weight: 0.4,
  },
  {
    module: 'fraud',
    type: 'Kara Liste Eşleşmesi',
    title: 'Kara listedeki kişi şubeye giriş yaptı',
    description: 'Yüz tanıma ağı, güneş gözlüğüne rağmen kara listede kayıtlı bir kişiyi giriş kapısında tespit etti. Güvenlik birimi bilgilendirildi.',
    severity: 'kritik',
    camera: 'Giriş · KAM-01',
    images: ['/images/dolandiricilik/dolandir3.jpg'],
    weight: 0.3,
  },
  {
    module: 'fraud',
    type: 'Kara Liste Eşleşmesi',
    title: 'KL-0192 giriş kapısında · Sahte Kimlik',
    description: 'Sahte kimlik kaydı bulunan KL-0192 numaralı kişi giriş kapısından şubeye girdi. Güvenlik birimine bildirildi.',
    severity: 'kritik',
    camera: 'Giriş Kapısı · KAM-01',
    images: ['/images/dolandiricilik/dolandir4.jpg'],
    reference: ['/images/blacklist/person-1.jpg'],
    weight: 0.4,
  },
  {
    module: 'fraud',
    type: 'Kara Liste Eşleşmesi',
    title: 'KL-0187 şubeye giriş yaptı',
    description: 'Dolandırıcılık geçmişi kaydı bulunan KL-0187 numaralı kişi şapkayla giriş yaptı; yüz tanıma %99,2 eşleşme verdi.',
    severity: 'kritik',
    camera: 'Giriş · KAM-01',
    images: ['/images/dolandiricilik/dolandir5.jpg'],
    confidence: 0.992,
    weight: 0.4,
  },
  // Operasyonel kareler: public/images/operasyonel/ (her kare kendi olay türüne bağlı)
  {
    module: 'operations',
    type: 'Bekleme Süresi KPI Aşımı',
    title: 'Bekleme süresi 12 dakikayı aştı',
    description: 'Gişe önü kuyruğunda ortalama bekleme 12,4 dk ile KPI eşiğini (10 dk) aştı. Operasyon yöneticisine uyarı gönderildi.',
    severity: 'yuksek',
    camera: 'Gişe Önü · Kamera 06',
    images: ['/images/operasyonel/oper1.jpg'],
    weight: 2,
  },
  {
    module: 'operations',
    type: 'Gişe Boş',
    title: 'Aktif gişede personel bulunmuyor',
    description: 'Kuyruk varken 5 numaralı gişede personel tespit edilmedi. Aktif gişe 4/5, ortalama hizmet 4 dk 58 sn.',
    severity: 'orta',
    camera: 'Banko Alanı · Kamera 07',
    images: ['/images/operasyonel/oper2.jpg'],
    weight: 1,
  },
  {
    module: 'operations',
    type: 'Uzun Etkileşim Süresi',
    title: 'Gişe 2 etkileşim süresi 6 dk 42 sn',
    description: 'Bireysel işlemde personel/müşteri etkileşim süresi SLA hedefini aştı; sırada 3 müşteri bekliyor. SLA kaydı incelemeye alındı.',
    severity: 'dusuk',
    camera: 'Gişe 2 · Kamera 08',
    images: ['/images/operasyonel/oper3.jpg'],
    weight: 1,
  },
  {
    module: 'operations',
    type: 'Yoğunluk ve Bekleme Artışı',
    title: 'Kuyrukta 11 kişi, tahmini bekleme 14 dk',
    description: 'Bekleme alanında kuyruk hızla uzuyor; SLA uyumu %89,7\'ye düştü. Ek gişe açılması önerilir.',
    severity: 'yuksek',
    camera: 'Bekleme Alanı · Kamera 09',
    images: ['/images/operasyonel/oper4.jpg'],
    weight: 1,
  },
  {
    module: 'operations',
    type: 'KPI Eşiği Yaklaşıyor',
    title: 'Ortalama bekleme 8,9 dk — eşiğe yaklaşıyor',
    description: 'Ortalama bekleme süresi 10 dk KPI eşiğine yaklaştı. Aktif gişe 5/6, SLA uyumu %94,8. Önleyici bilgilendirme.',
    severity: 'dusuk',
    camera: 'Genel Operasyon · Kamera 10',
    images: ['/images/operasyonel/oper5.jpg'],
    weight: 1,
  },
  {
    module: 'cash',
    type: 'Açıkta Kalan Nakit',
    title: 'Banko üzerinde gözetimsiz nakit',
    description: 'Banko üzerinde nakit 90 saniyeden uzun süre personelsiz kaldı. Sessiz alarm üretildi.',
    severity: 'yuksek',
    camera: 'Banko Alanı · Kamera 02',
    images: ['/images/banko-guvenligi/banko1.jpg', '/images/banko-guvenligi/banko2.jpg', '/images/banko-guvenligi/banko3.jpg', '/images/banko-guvenligi/banko4.jpg', '/images/banko-guvenligi/banko5.jpg'],
    weight: 2,
  },
  // ATM kareleri: public/images/atm-resimler/ (her kare kendi olay türüne bağlı)
  {
    module: 'atm',
    type: 'Sahipsiz Paket',
    title: 'ATM kabininde sahipsiz çanta',
    description: 'ATM kabininde bırakılan bir çanta 3 dakikadır sahipsiz. Şüpheli paket prosedürü başlatılmalı.',
    severity: 'kritik',
    camera: 'ATM Kabini · Kamera 11',
    images: ['/images/atm-resimler/atm3.jpg'],
    weight: 1,
  },
  {
    module: 'atm',
    type: 'Saldırı Aracı · Levye',
    title: 'ATM önünde levye tespit edildi',
    description: 'ATM cihazına yönelik tehdit oluşturabilecek bir alet (levye) tespit edildi. Güvenlik birimi bilgilendirildi.',
    severity: 'kritik',
    camera: 'ATM Dış Cephe · Kamera 12',
    images: ['/images/atm-resimler/atm1.jpg'],
    weight: 1,
  },
  {
    module: 'atm',
    type: 'Saldırı Aracı · Matkap',
    title: 'ATM kabininde matkap kullanımı tespit edildi',
    description: 'Kabindeki kişinin ATM cihazına matkapla müdahale ettiği tespit edildi. Güvenlik birimine ve kolluğa iletilmek üzere kritik alarm üretildi.',
    severity: 'kritik',
    camera: 'ATM Kabini · Kamera 13',
    images: ['/images/atm-resimler/atm4.jpg'],
    weight: 1,
  },
  {
    module: 'atm',
    type: 'Saldırı Aracı · Sprey Boya',
    title: 'ATM alanında sprey boya ile tahribat',
    description: 'ATM alanında sprey boya kullanan bir kişi tespit edildi; cephe ve kamera görüşü risk altında.',
    severity: 'yuksek',
    camera: 'ATM Alanı · Kamera 14',
    images: ['/images/atm-resimler/atm2.jpg'],
    weight: 1,
  },
  {
    module: 'atm',
    type: 'Barınma / Uyuma',
    title: 'ATM kabininde uzun süre hareketsiz kişi',
    description: 'Kabinde yere uzanmış ve 20 dakikadır hareketsiz bir kişi tespit edildi.',
    severity: 'orta',
    camera: 'ATM Kabini · Kamera 15',
    images: ['/images/atm-resimler/atm5.jpg'],
    weight: 1,
  },
]

let counter = 0
const nextId = () => `ALR-${(24810 + ++counter).toString()}`

export function createAlarm(rand: () => number, time: Date, forcedBranch?: string): Alarm {
  const totalWeight = alarmTemplates.reduce((s, t) => s + t.weight, 0)
  let pick = rand() * totalWeight
  const tpl = alarmTemplates.find((t) => (pick -= t.weight) < 0) ?? alarmTemplates[0]
  return buildAlarm(tpl, Math.floor(rand() * tpl.images.length), rand, time, forcedBranch)
}

function buildAlarm(tpl: AlarmTemplate, idx: number, rand: () => number, time: Date, forcedBranch?: string): Alarm {
  // Canlı olayların çoğu pilot şubeden gelsin
  const branch = forcedBranch ?? (rand() < 0.45 ? 'atasehir' : branches[Math.floor(rand() * branches.length)].id)
  return {
    id: nextId(),
    module: tpl.module,
    type: tpl.type,
    title: tpl.title,
    description: tpl.description,
    severity: tpl.severity,
    branchId: branch,
    camera: tpl.camera,
    time,
    image: tpl.images[idx],
    referenceImage: tpl.reference?.[idx],
    confidence: tpl.confidence ?? 0.9 + rand() * 0.095,
    status: 'yeni',
    read: false,
  }
}

export function seedAlarms(count = 28): Alarm[] {
  const rand = seeded(42)
  const now = Date.now()
  const list: Alarm[] = []
  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(i * 48 + rand() * 40) + 2
    const alarm = createAlarm(rand, new Date(now - minutesAgo * 60_000))
    if (i > 3) alarm.read = true
    if (i > 6) alarm.status = rand() < 0.15 ? 'yanlis' : 'kapandi'
    else if (i > 2) alarm.status = 'inceleniyor'
    list.push(alarm)
  }

  // Her görsel Alarm Merkezi'nde en az bir kez görünsün (geçmiş, kapatılmış olay olarak)
  const shown = new Set(list.map((a) => a.image))
  let minutesAgo = count * 48 + 30
  for (const tpl of alarmTemplates) {
    tpl.images.forEach((img, idx) => {
      if (shown.has(img)) return
      minutesAgo += 35 + Math.floor(rand() * 60)
      const alarm = buildAlarm(tpl, idx, rand, new Date(now - minutesAgo * 60_000))
      alarm.read = true
      alarm.status = 'kapandi'
      list.push(alarm)
    })
  }
  return list
}
