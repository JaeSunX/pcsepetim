import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://teknoel.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profil',
          '/api/',
          '/ilan/yeni',
          '/giris',
          '/kayit',
        ],
      },
      // Yapay zeka botlarını engelle (isteğe bağlı)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
