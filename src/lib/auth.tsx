import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { branches, type Branch, type RegionId } from '@/data/branches'

/** Teklifteki yetkilendirme matrisi (RBAC) */
export type Role = 'genel-mudurluk' | 'bolge-muduru' | 'sube-muduru' | 'guvenlik'

export interface User {
  name: string
  email: string
  title: string
  role: Role
  regionId?: RegionId
  branchId?: string
  avatar?: string
}

export const roleLabel: Record<Role, string> = {
  'genel-mudurluk': 'Genel Müdürlük',
  'bolge-muduru': 'Bölge Müdürü',
  'sube-muduru': 'Şube Müdürü',
  guvenlik: 'Güvenlik Birimi',
}

export const demoUsers: (User & { password: string })[] = [
  { name: 'Ayşe Demir', email: 'genel@hypevision.demo', password: 'demo1234', title: 'Güvenlik Operasyonları Direktörü', role: 'genel-mudurluk', avatar: '/images/avatars/user-1.jpg' },
  { name: 'Mehmet Kaya', email: 'bolge@hypevision.demo', password: 'demo1234', title: 'Anadolu 1. Bölge Müdürü', role: 'bolge-muduru', regionId: 'anadolu-1', avatar: '/images/avatars/user-2.jpg' },
  { name: 'Zeynep Arslan', email: 'sube@hypevision.demo', password: 'demo1234', title: 'Ataşehir Merkez Şube Müdürü', role: 'sube-muduru', branchId: 'atasehir', avatar: '/images/avatars/user-3.jpg' },
]

/** Kullanıcının rolüne göre görebileceği şubeler */
export function visibleBranches(user: User | null): Branch[] {
  if (!user) return []
  if (user.role === 'bolge-muduru') return branches.filter((b) => b.regionId === user.regionId)
  if (user.role === 'sube-muduru' || user.role === 'guvenlik') return branches.filter((b) => b.id === user.branchId)
  return branches
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string, remember?: boolean) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'hv.session'

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession)

  // Sadece arayüz: backend bağlanana kadar demo hesaplarla sahte giriş
  const login = useCallback(async (email: string, password: string, remember = true) => {
    await new Promise((r) => setTimeout(r, 700))
    const found = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found || found.password !== password) {
      throw new Error('E-posta adresi veya şifre hatalı.')
    }
    const { password: _pw, ...session } = found
    void _pw
    ;(remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}
