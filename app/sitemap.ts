import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { kategoriler } from '@/lib/kategoriler'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://teknoel.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Aktif ilanlar
  const ilanlar = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, guncelleme: true, kategori: true },
    orderBy: { guncelleme: 'desc' },
  })

  const ilanUrls: MetadataRoute.Sitemap = ilanlar.map((ilan: { id: string; guncelleme: Date; kategori: string }) => ({
    url: `${BASE_URL}/ilan/${ilan.id}`,
    lastModified: ilan.guncelleme,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Kategori sayfaları
  const kategoriUrls: MetadataRoute.Sitemap = kategoriler.map((k) => ({
    url: `${BASE_URL}/kategori/${k.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }))

  // Statik sayfalar
  const statikUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/doping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/ara`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
  ]

  return [...statikUrls, ...kategoriUrls, ...ilanUrls]
}
