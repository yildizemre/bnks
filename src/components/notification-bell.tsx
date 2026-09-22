import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/lib/notifications'
import { AlarmListItem } from './alarm-items'

export function NotificationBell() {
  const { alarms, unreadCount, markAllRead } = useNotifications()
  const recent = alarms.slice(0, 12)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Bildirimler">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(420px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Bildirimler</p>
            <p className="text-xs text-muted-foreground">{unreadCount} okunmamış alarm</p>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={!unreadCount}>
            <CheckCheck /> Tümünü okundu say
          </Button>
        </div>
        <ScrollArea className="h-[420px]">
          <div className="space-y-0.5 p-2">
            {recent.map((a) => (
              <AlarmListItem key={a.id} alarm={a} />
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <Button asChild variant="secondary" className="w-full">
            <Link to="/alarmlar">Alarm Merkezi'ne git</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
