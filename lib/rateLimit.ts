/**
 * Basit in-memory rate limiter.
 * Production'da Redis/Upstash kullanılmalıdır.
 * Serverless ortamlarda (Vercel) her instance ayrı bellek kullanır;
 * küçük trafikte yeterlidir.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Eski kayıtları temizle (bellek sızıntısını önle)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) store.delete(key)
    }
  }, 60_000)
}

/**
 * @param key      Benzersiz tanımlayıcı (IP, email vb.)
 * @param max      İzin verilen maksimum istek sayısı
 * @param windowMs Zaman penceresi (ms)
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: max - record.count, resetAt: record.resetAt }
}

/** İstemci IP'sini Next.js request header'larından çeker */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
