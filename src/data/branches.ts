export type RegionId = 'anadolu-1' | 'anadolu-2' | 'avrupa-1'

export interface Region {
  id: RegionId
  name: string
}

export interface Branch {
  id: string
  name: string
  regionId: RegionId
  district: string
  status: 'pilot' | 'kurulum' | 'planlandi'
  cameras: number
  atms: number
  counters: number
  capacity: number
  /** Şube kapak görseli */
  image: string
}

export const regions: Region[] = [
  { id: 'anadolu-1', name: 'İstanbul Anadolu 1. Bölge' },
  { id: 'anadolu-2', name: 'İstanbul Anadolu 2. Bölge' },
  { id: 'avrupa-1', name: 'İstanbul Avrupa 1. Bölge' },
]

export const branches: Branch[] = [
  { id: 'atasehir', name: 'Ataşehir Merkez', regionId: 'anadolu-1', district: 'Ataşehir', status: 'pilot', cameras: 14, atms: 3, counters: 6, capacity: 60, image: '/images/subeler/sube1.jpg' },
  { id: 'kadikoy', name: 'Kadıköy Çarşı', regionId: 'anadolu-1', district: 'Kadıköy', status: 'kurulum', cameras: 11, atms: 2, counters: 5, capacity: 45, image: '/images/subeler/sube2.jpg' },
  { id: 'umraniye', name: 'Ümraniye', regionId: 'anadolu-1', district: 'Ümraniye', status: 'planlandi', cameras: 9, atms: 2, counters: 4, capacity: 40, image: '/images/subeler/sube3.jpg' },
  { id: 'uskudar', name: 'Üsküdar Meydan', regionId: 'anadolu-2', district: 'Üsküdar', status: 'planlandi', cameras: 10, atms: 2, counters: 4, capacity: 40, image: '/images/subeler/sube4.jpg' },
  { id: 'kartal', name: 'Kartal', regionId: 'anadolu-2', district: 'Kartal', status: 'planlandi', cameras: 8, atms: 2, counters: 4, capacity: 35, image: '/images/subeler/sube5.jpg' },
  { id: 'levent', name: 'Levent Plaza', regionId: 'avrupa-1', district: 'Beşiktaş', status: 'planlandi', cameras: 16, atms: 4, counters: 8, capacity: 80, image: '/images/subeler/sube6.jpg' },
]

export const branchById = (id: string) => branches.find((b) => b.id === id)
export const regionById = (id: RegionId) => regions.find((r) => r.id === id)

export const branchStatusLabel: Record<Branch['status'], string> = {
  pilot: 'Pilot · Canlı',
  kurulum: 'Kurulumda',
  planlandi: 'Planlandı',
}
