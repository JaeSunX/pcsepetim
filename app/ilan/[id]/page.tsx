import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatFiyat, formatTarih, parseResimler, dopingAktifMi } from '@/lib/utils'
import type { IlanKarti as IlanTip } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  MapPin, Eye, Clock, Phone, User, Calendar,
  Star, Home, Zap, ChevronLeft, Shield, Edit
} from 'lucide-react'
import IlanDetayClient from '@/components/IlanDetayClient'
import YorumlarClient from '@/components/YorumlarClient'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://teknoel.com'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const ilan = await prisma.ilan.findUnique({
    where: { id: params.id },
    select: { baslik: true, fiyat: true, sehir: true, aciklama: true, resimler: true, kategori: true },
  })
  if (!ilan) return { title: 'İlan Bulunamadı' }

  const resimler = parseResimler(ilan.resimler)
  const desc = ilan.aciklama?.slice(0, 155) ?? `${ilan.baslik} - ${ilan.sehir}`
  const ogImages = resimler.slice(0, 3).map((img) => ({
    url: img.startsWith('http') ? img : `${BASE_URL}${img}`,
    width: 1200,
    height: 630,
    alt: ilan.baslik,
  }))

  return {
    title: `${ilan.baslik} - ${formatFiyat(ilan.fiyat)}`,
    description: desc,
    alternates: { canonical: `${BASE_URL}/ilan/${params.id}` },
    openGraph: {
      title: `${ilan.baslik} - ${formatFiyat(ilan.fiyat)}`,
      description: desc,
      images: ogImages,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Teknoel',
      url: `${BASE_URL}/ilan/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ilan.baslik} - ${formatFiyat(ilan.fiyat)}`,
      description: desc,
      images: ogImages[0] ? [ogImages[0].url] : [],
    },
  }
}

export default async function IlanDetayPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const ilan = await prisma.ilan.findUnique({
    where: { id: params.id },
    include: {
      kullanici: {
        select: {
          id: true,
          email: true,
          ad: true,
          telefon: true,
          sehir: true,
          biyografi: true,
          olusturma: true,
          _count: { select: { ilanlar: true } },
        },
      },
    },
  })

  if (!ilan) notFound()

  // Görüntülenmeyi artır
  await prisma.ilan.update({
    where: { id: params.id },
    data: { goruntuleme: { increment: 1 } },
  })

  const resimler = parseResimler(ilan.resimler)
  const dopingAktif = dopingAktifMi(ilan.dopingBitis ? new Date(ilan.dopingBitis) : null)
  const vitrinAktif = ilan.vitrin && dopingAktif
  const anasayfaAktif = ilan.anasayfaPin && dopingAktif

  // JSON-LD: Product + BreadcrumbList
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: ilan.baslik,
      description: ilan.aciklama,
      image: resimler.map((r) => (r.startsWith('http') ? r : `${BASE_URL}${r}`)),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'TRY',
        price: ilan.fiyat,
        availability:
          ilan.durum === 'AKTIF'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
        url: `${BASE_URL}/ilan/${ilan.id}`,
        seller: {
          '@type': 'Person',
          name: ilan.kullanici.ad,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: ilan.kategori,
          item: `${BASE_URL}/kategori/${ilan.kategori}`,
        },
        { '@type': 'ListItem', position: 3, name: ilan.baslik },
      ],
    },
  ]

  // Benzer ilanlar
  const benzerIlanlar = await prisma.ilan.findMany({
    where: {
      kategori: ilan.kategori,
      durum: 'AKTIF',
      id: { not: ilan.id },
    },
    include: {
      kullanici: { select: { id: true, ad: true, sehir: true } },
    },
    orderBy: { goruntuleme: 'desc' },
    take: 4,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* JSON-LD Structured Data */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link href={`/kategori/${ilan.kategori}`} className="hover:text-primary-600">
          {ilan.kategori}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{ilan.baslik}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Resimler + Detaylar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Doping rozetleri */}
          {(vitrinAktif || anasayfaAktif) && (
            <div className="flex gap-2">
              {vitrinAktif && (
                <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1.5 rounded-full">
                  <Star size={12} />
                  VİTRİN İLAN
                </span>
              )}
              {anasayfaAktif && (
                <span className="flex items-center gap-1 bg-violet-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                  <Home size={12} />
                  ANASAYFA
                </span>
              )}
            </div>
          )}

          {/* Resim galerisi - Client component */}
          <IlanDetayClient resimler={resimler} ilanBaslik={ilan.baslik} />

          {/* İlan detayları */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            {/* Başlık & Fiyat */}
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1
                  className={`text-2xl ${ilan.kalinYazi && dopingAktif ? 'font-black' : 'font-bold'} ${
                    ilan.renkliYazi && dopingAktif ? 'text-primary-600' : 'text-gray-900'
                  } leading-tight flex-1`}
                >
                  {ilan.baslik}
                </h1>
                {session?.user?.email === ilan.kullanici.email && (
                  <Link
                    href={`/ilan/${ilan.id}/duzenle`}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shrink-0"
                  >
                    <Edit size={16} />
                    Düzenle
                  </Link>
                )}
              </div>
              <p className="text-3xl font-black text-primary-600">{formatFiyat(ilan.fiyat)}</p>
            </div>

            {/* Meta bilgiler */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-4 border-b border-gray-100">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                {ilan.ilce ? `${ilan.ilce}, ${ilan.sehir}` : ilan.sehir}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                {formatTarih(ilan.olusturma)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-gray-400" />
                {ilan.goruntuleme} görüntülenme
              </span>
            </div>

            {/* Açıklama */}
            <div className="mt-4">
              <h2 className="font-bold text-gray-800 mb-3">İlan Açıklaması</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {ilan.aciklama}
              </div>
            </div>

            {/* Kategori */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <Link
                href={`/kategori/${ilan.kategori}`}
                className="inline-flex items-center gap-1 bg-blue-50 text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {ilan.kategori}
              </Link>
              {ilan.altKategori && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  {ilan.altKategori}
                </span>
              )}
              <span
                className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${
                  ilan.durum === 'AKTIF'
                    ? 'bg-green-100 text-green-700'
                    : ilan.durum === 'SATILDI'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {ilan.durum === 'AKTIF' ? '✓ Satışta' : ilan.durum === 'SATILDI' ? '✗ Satıldı' : '○ Pasif'}
              </span>
            </div>
          </div>
        </div>

        {/* Sağ: Satıcı bilgileri */}
        <div className="space-y-4">
          {/* Satıcı Kartı */}
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-20">
            {/* Satıcı */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <User size={24} className="text-primary-500" />
              </div>
              <div>
                <Link
                  href={`/api/kullanici?id=${ilan.kullanici.id}`}
                  className="font-bold text-gray-800 hover:text-primary-600 transition-colors"
                >
                  {ilan.kullanici.ad}
                </Link>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin size={11} />
                  {ilan.kullanici.sehir || 'Belirtilmedi'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Calendar size={11} />
                  {ilan.kullanici._count.ilanlar} ilan · {formatTarih(ilan.kullanici.olusturma)} üye
                </div>
              </div>
            </div>

            {/* İletişim butonları */}
            {ilan.kullanici.telefon ? (
              <div className="space-y-3">
                <a
                  href={`tel:${ilan.kullanici.telefon}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Phone size={18} />
                  Telefonu Göster
                </a>
                <a
                  href={`https://wa.me/90${ilan.kullanici.telefon?.replace(/\D/g, '').slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  💬 WhatsApp ile İletişim
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                İletişim bilgisi paylaşılmamış
              </div>
            )}

            {/* Güvenlik notu */}
            <div className="mt-4 flex items-start gap-2 bg-blue-50 rounded-xl p-3">
              <Shield size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600">
                Güvenli alışveriş için ödeme yapmadan ürünü kontrol edin.
                Dolandırıcılığa karşı dikkatli olun.
              </p>
            </div>

            {/* Doping Al */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Bu ilana doping alın</p>
              <Link
                href="/doping"
                className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                <Zap size={14} />
                Doping Paketleri
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Yorumlar */}
      <div className="mt-8">
        <YorumlarClient ilanId={ilan.id} />
      </div>

      {/* Benzer İlanlar */}
      {benzerIlanlar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Benzer İlanlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {benzerIlanlar.map((benzer: IlanTip) => {
              const bResimler = parseResimler(benzer.resimler)
              return (
                <Link key={benzer.id} href={`/ilan/${benzer.id}`} className="group block">
                  <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={bResimler[0]}
                        alt={benzer.baslik}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={bResimler[0].startsWith('https://picsum')}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-primary-600 font-black text-base">{formatFiyat(benzer.fiyat)}</p>
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 mt-0.5">{benzer.baslik}</p>
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {benzer.sehir}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
