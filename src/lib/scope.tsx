import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Branch } from '@/data/branches'
import { useAuth, visibleBranches } from './auth'

interface ScopeContextValue {
  /** Kullanıcının yetkili olduğu şubeler */
  branches: Branch[]
  /** 'all' = yetkili olunan tüm şubeler */
  branchId: string
  setBranchId: (id: string) => void
  /** Seçili kapsamdaki şube id'leri */
  scopeIds: string[]
  /** Şube seçimine göre mock metrikleri ölçeklemek için katsayı */
  factor: number
}

const ScopeContext = createContext<ScopeContextValue | null>(null)

export function ScopeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const allowed = useMemo(() => visibleBranches(user), [user])
  const [branchId, setBranchId] = useState<string>(allowed.length === 1 ? allowed[0].id : 'all')

  const value = useMemo(() => {
    const valid = branchId === 'all' || allowed.some((b) => b.id === branchId) ? branchId : 'all'
    const scoped = valid === 'all' ? allowed : allowed.filter((b) => b.id === valid)
    const capacity = scoped.reduce((s, b) => s + b.capacity, 0)
    return {
      branches: allowed,
      branchId: valid,
      setBranchId,
      scopeIds: scoped.map((b) => b.id),
      factor: capacity / 60,
    }
  }, [allowed, branchId])

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
}

export function useScope() {
  const ctx = useContext(ScopeContext)
  if (!ctx) throw new Error('useScope, ScopeProvider içinde kullanılmalı')
  return ctx
}
