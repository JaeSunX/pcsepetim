import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fiyatı Türk Lirası formatında gösterir
 * örn: 38500 → "38.500 ₺"
 */
export function formatFiyat(fiyat: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fiyat)
}

/**
 * Tarihi Türkçe formatında gösterir
 * örn: "3 saat önce", "2 gün önce", "15 Ocak 2024"
 */
export function formatTarih(tarih: Date | string): string {
  const d = typeof tarih === 'string' ? new Date(tarih) : tarih
  const simdi = new Date()
  const fark = simdi.getTime() - d.getTime()
  const dakika = Math.floor(fark / 60000)
  const saat = Math.floor(dakika / 60)
  const gun = Math.floor(saat / 24)

  if (dakika < 1) return 'Az önce'
  if (dakika < 60) return `${dakika} dakika önce`
  if (saat < 24) return `${saat} saat önce`
  if (gun < 7) return `${gun} gün önce`

  return d.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Görüntülenme sayısını kısalt
 * örn: 2891 → "2.8B"
 */
export function formatGoruntulenme(sayi: number): string {
  if (sayi >= 1000) {
    return `${(sayi / 1000).toFixed(1)}B`
  }
  return sayi.toString()
}

/**
 * URL dostu slug oluşturur
 */
export function slugify(metin: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'C', ş: 's', Ş: 'S', ı: 'i', İ: 'I',
    ğ: 'g', Ğ: 'G', ü: 'u', Ü: 'U', ö: 'o', Ö: 'O',
  }
  return metin
    .split('')
    .map((c) => trMap[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Resim dizisini JSON'dan parse eder
 */
export function parseResimler(resimlerJson: string): string[] {
  try {
    const parsed = JSON.parse(resimlerJson)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
    return ['/placeholder-ilan.jpg']
  } catch {
    return ['/placeholder-ilan.jpg']
  }
}

/**
 * Dopingin aktif olup olmadığını kontrol eder
 */
export function dopingAktifMi(dopingBitis: Date | null | undefined): boolean {
  if (!dopingBitis) return false
  return new Date(dopingBitis) > new Date()
}

/**
 * HTML etiketlerini ve tehlikeli karakterleri temizler (XSS koruması)
 * Sunucu tarafı API route'larında kullanılmalıdır.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * HTML etiketlerini silerek düz metin döndürür (aciklama alanları için)
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}
