import { useState, type ComponentProps } from 'react'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartImageProps extends Omit<ComponentProps<'img'>, 'src'> {
  src?: string
  /** Görsel yokken yer tutucuda dosya yolunu göster (geliştirme için) */
  hint?: boolean
  fallbackClassName?: string
  /** contain: görseli kırpmadan sığdır (ör. alarm detayı) */
  fit?: 'cover' | 'contain'
}

/**
 * Görsel henüz eklenmemişse / yüklenemezse şık bir yer tutucu gösterir.
 * Yer tutucuda beklenen dosya yolu yazar, böylece görselin nereye konacağı bellidir.
 */
export function SmartImage({ src, alt, className, hint = true, fallbackClassName, fit = 'cover', ...props }: SmartImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>()
  const failed = !src || failedSrc === src

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-gradient-to-br from-muted to-muted/40 text-muted-foreground',
          className,
          fallbackClassName,
        )}
      >
        <ImageIcon className="size-6 opacity-60" />
        {hint && src && (
          <span className="max-w-[90%] truncate rounded bg-background/70 px-1.5 py-0.5 font-mono text-[10px] leading-tight">
            public{src}
          </span>
        )}
      </div>
    )
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={cn('bg-muted text-transparent', fit === 'contain' ? 'bg-black object-contain' : 'object-cover', className)} {...props} />
}
