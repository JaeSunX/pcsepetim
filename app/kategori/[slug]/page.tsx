import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import IlanKarti from '@/components/IlanKarti'
import type { IlanKarti as IlanTip } from '@/lib/types'
import { kategoriler, kategoriGetir } from '@/lib/kategoriler'
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const kat = kategoriGetir(params.slug)
  if (!kat) return { title: 'Kategori Bulunamadı' }
  return {
    title: `${kat.ad} İlanları`,
    description: `${kat.ad} kategorisinde ikinci el ve sıfır ürünler.`,
  }
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { siralama?: string; altKat?: string; sehir?: string; sayfa?: string }
}) {
  const kat = kategoriGetir(params.slug)
  if (!kat) notFound()

  const sayfa = parseInt(searchParams.sayfa || '1')
  const limit = 20
  const siralama = searchParams.siralama || 'yeni'
  const simdi = new Date()

  const where: Record<string, unknown> = {
    durum: 'AKTIF',
    kategori: kat.ad,
  }

  if (searchParams.altKat) where.altKategori = searchParams.altKat
  if (searchParams.sehir) where.sehir = searchParams.sehir

  const siralamalar: Record<string, object> = {
    yeni: { olusturma: 'desc' },
    eski: { olusturma: 'asc' },
    ucuz: { fiyat: 'asc' },
    pahali: { fiyat: 'desc' },
    populer: { goruntuleme: 'desc' },
  }

  // Vitrin + anasayfa ilanlarını öne al
  const [vitrinIlanlar, normalIlanlar, toplam] = await Promise.all([
    prisma.ilan.findMany({
      where: { ...where, vitrin: true, dopingBitis: { gt: simdi } },
      include: { kullanici: { select: { id: true, ad: true, sehir: true } } },
      orderBy: { goruntuleme: 'desc' },
      take: 4,
    }),
    prisma.ilan.findMany({
      where: { ...where, OR: [{ vitrin: false }, { dopingBitis: { lte: simdi } }] },
      include: { kullanici: { select: { id: true, ad: true, sehir: true } } },
      orderBy: siralamalar[siralama] || { olusturma: 'desc' },
      skip: (sayfa - 1) * limit,
      take: limit,
    }),
    prisma.ilan.count({ where }),
  ])

  const toplamSayfa = Math.ceil(toplam / limit)

  const buildUrl = (extra: Record<string, string>) => {
    const p = new URLSearchParams({
      siralama,
      ...(searchParams.altKat && { altKat: searchParams.altKat }),
      ...(searchParams.sehir && { sehir: searchParams.sehir }),
      ...extra,
    })
    return `/kategori/${params.slug}?${p.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{kat.ikon}</span>
        <div>
          <h1 className="text-2xl font-black text-gray-800">{kat.ad}</h1>
          <p className="text-gray-500 text-sm">{toplam} ilan bulundu</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtreler (sol panel) */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter size={16} className="text-primary-500" />
              Filtrele
            </h2>

            {/* Alt Kategoriler */}
            {kat.altKategoriler.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Alt Kategori
                </h3>
                <div className="space-y-1">
                  <Link
                    href={buildUrl({ sayfa: '1', altKat: '' })}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !searchParams.altKat
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Tümü
                  </Link>
                  {kat.altKategoriler.map((ak) => (
                    <Link
                      key={ak.id}
                      href={buildUrl({ sayfa: '1', altKat: ak.ad })}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        searchParams.altKat === ak.ad
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {ak.ad}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Diğer Kategoriler */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Diğer Kategoriler
              </h3>
              <div className="space-y-1">
                {kategoriler.filter((k) => k.id !== kat.id).slice(0, 5).map((k) => (
                  <Link
                    key={k.id}
                    href={`/kategori/${k.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span>{k.ikon}</span>
                    {k.ad}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* İlanlar */}
        <div className="flex-1 min-w-0">
          {/* Sıralama */}
          <div className="flex items-center gap-3 mb-4 bg-white rounded-2xl shadow-card px-4 py-3">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500 mr-auto">Sırala:</span>
            {[
              { key: 'yeni', label: 'En Yeni' },
              { key: 'ucuz', label: 'En Ucuz' },
              { key: 'pahali', label: 'En Pahalı' },
              { key: 'populer', label: 'Popüler' },
            ].map((s) => (
              <Link
                key={s.key}
                href={buildUrl({ siralama: s.key, sayfa: '1' })}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  siralama === s.key
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Vitrin ilanları */}
          {vitrinIlanlar.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                  ⭐ VİTRİN İLANLAR
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                {vitrinIlanlar.map((ilan: IlanTip) => (
                  <IlanKarti key={ilan.id} ilan={ilan} />
                ))}
              </div>
            </div>
          )}

          {/* Normal ilanlar */}
          {normalIlanlar.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {normalIlanlar.map((ilan: IlanTip) => (
                <IlanKarti key={ilan.id} ilan={ilan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-lg font-medium">Bu kategoride ilan bulunamadı.</p>
              <Link href="/ilan/yeni" className="btn-primary mt-4 inline-block">
                İlk İlanı Sen Ver
              </Link>
            </div>
          )}

          {/* Sayfalama */}
          {toplamSayfa > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {sayfa > 1 && (
                <Link
                  href={buildUrl({ sayfa: String(sayfa - 1) })}
                  className="px-4 py-2 bg-white rounded-xl shadow-card text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  ← Önceki
                </Link>
              )}
              <span className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold">
                {sayfa} / {toplamSayfa}
              </span>
              {sayfa < toplamSayfa && (
                <Link
                  href={buildUrl({ sayfa: String(sayfa + 1) })}
                  className="px-4 py-2 bg-white rounded-xl shadow-card text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  Sonraki →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
