import { useId, useState } from 'react'
import { useTheme } from 'next-themes'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

/** Yerleşik işaret — gerçek logo eklenene kadar kullanılır */
export function BrandMark({ className }: { className?: string }) {
  const gid = `hv-g-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg viewBox="0 0 64 64" className={cn('size-8 shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.62 0.24 285)" />
          <stop offset="1" stopColor="oklch(0.6 0.16 220)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
      <path d="M9 32c6-10 14-15 23-15s17 5 23 15c-6 10-14 15-23 15S15 42 9 32Z" fill="none" stroke="#fff" strokeWidth="4" />
      <circle cx="32" cy="32" r="7.5" fill="#fff" />
      <circle cx="35" cy="29" r="2.4" fill="oklch(0.55 0.22 275)" />
    </svg>
  )
}

function FallbackLogo({ compact, className, textClassName }: { compact?: boolean; className?: string; textClassName?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      {!compact && (
        <span className={cn('flex flex-col leading-none', textClassName)}>
          <span className="text-[15px] font-semibold tracking-tight">{brand.name}</span>
          <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">AI Vision</span>
        </span>
      )}
    </span>
  )
}

interface BrandLogoProps {
  /** Sadece kare işaret */
  compact?: boolean
  className?: string
  imgClassName?: string
  textClassName?: string
  /** Koyu zemin üzerinde mi (login görseli gibi) */
  onDark?: boolean
}

/**
 * `public/brand/` altındaki logoyu gösterir; dosya yoksa yerleşik işaret + yazıya düşer.
 */
export function BrandLogo({ compact, className, imgClassName, textClassName, onDark }: BrandLogoProps) {
  const { resolvedTheme } = useTheme()
  const dark = onDark || resolvedTheme === 'dark'
  const candidates = compact ? [brand.logoMark] : dark ? [brand.logoDark, brand.logo] : [brand.logo, brand.logoDark]
  const [failed, setFailed] = useState<string[]>([])
  const src = candidates.find((c) => !failed.includes(c))

  if (!src) return <FallbackLogo compact={compact} className={className} textClassName={textClassName} />

  // Açık zeminde yalnızca beyaz yazılı koyu logo varsa: yazıyı koyulaştır, turkuazı koru
  const invertOnLight = !dark && !compact && src === brand.logoDark

  return (
    <span className={cn('flex items-center', className)}>
      <img
        src={src}
        alt={brand.name}
        className={cn(compact ? 'size-8 object-contain' : 'h-7 w-auto object-contain', invertOnLight && 'invert hue-rotate-180', imgClassName)}
        onError={() => setFailed((f) => [...f, src])}
      />
    </span>
  )
}
