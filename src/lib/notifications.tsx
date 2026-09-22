import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createAlarm, seedAlarms, type Alarm, type AlarmStatus } from '@/data/alarms'
import { showAlarmToast } from '@/components/alarm-toast'
import { useScope } from './scope'

interface NotificationContextValue {
  /** Kullanıcının kapsamındaki (şube seçimine göre filtrelenmiş) alarmlar, yeniden eskiye */
  alarms: Alarm[]
  unreadCount: number
  live: boolean
  setLive: (v: boolean) => void
  selected: Alarm | null
  openAlarm: (id: string) => void
  closeAlarm: () => void
  markAllRead: () => void
  setStatus: (id: string, status: AlarmStatus) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)
const LIVE_KEY = 'hv.live'
const LIVE_INTERVAL_MS = 40_000

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { scopeIds, branches } = useScope()
  const [all, setAll] = useState<Alarm[]>(() => seedAlarms())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLiveState] = useState(() => {
    try {
      return localStorage.getItem(LIVE_KEY) !== '0'
    } catch {
      return true
    }
  })

  const setLive = useCallback((v: boolean) => {
    setLiveState(v)
    try {
      localStorage.setItem(LIVE_KEY, v ? '1' : '0')
    } catch {
      /* yok say */
    }
  }, [])

  const openAlarm = useCallback((id: string) => {
    setSelectedId(id)
    setAll((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }, [])

  // Canlı akış simülasyonu — backend WebSocket bağlanınca burası değişecek
  useEffect(() => {
    if (!live || branches.length === 0) return
    const timer = setInterval(() => {
      const branch = scopeIds[Math.floor(Math.random() * scopeIds.length)] ?? branches[0].id
      const alarm = createAlarm(Math.random, new Date(), branch)
      setAll((prev) => [alarm, ...prev].slice(0, 200))
      showAlarmToast(alarm, () => openAlarm(alarm.id))
    }, LIVE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [live, scopeIds, branches, openAlarm])

  const value = useMemo<NotificationContextValue>(() => {
    const alarms = all.filter((a) => scopeIds.includes(a.branchId))
    return {
      alarms,
      unreadCount: alarms.filter((a) => !a.read).length,
      live,
      setLive,
      selected: all.find((a) => a.id === selectedId) ?? null,
      openAlarm,
      closeAlarm: () => setSelectedId(null),
      markAllRead: () => setAll((prev) => prev.map((a) => ({ ...a, read: true }))),
      setStatus: (id, status) => setAll((prev) => prev.map((a) => (a.id === id ? { ...a, status, read: true } : a))),
    }
  }, [all, scopeIds, live, setLive, selectedId, openAlarm])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications, NotificationProvider içinde kullanılmalı')
  return ctx
}
