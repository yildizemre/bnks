/**
 * Marka ayarları — logo ve isim değişiklikleri sadece buradan yapılır.
 * Logo dosyalarını `public/brand/` klasörüne koyun. Dosya bulunamazsa
 * otomatik olarak yerleşik SVG işaret + yazı gösterilir.
 */
export const brand = {
  name: 'Hype Vision',
  tagline: 'Yapay Zekâ Destekli Güvenlik ve Operasyonel Zekâ',
  slogan: 'Görün. Anlayın. Önleyin.',
  product: 'Bankacılık Güvenlik ve Operasyonel Zekâ Platformu',
  /** Yatay tam logo (açık zemin). Yoksa koyu logo renkleri ters çevrilerek kullanılır. */
  logo: '/brand/logo.png',
  /** Yatay tam logo (koyu zemin) — kaynak: public/images/logo/logo.png */
  logoDark: '/brand/logo-dark.png',
  /** Kare işaret (daraltılmış menü) */
  logoMark: '/brand/logo-mark.png',
  website: 'www.hypevision.com.tr',
  support: 'destek@hypevision.com.tr',
  version: '1.0',
} as const
