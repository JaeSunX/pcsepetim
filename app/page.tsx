import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import IlanKarti from '@/components/IlanKarti'
import type { IlanKarti as IlanTip } from '@/lib/types'
import VitrinSection from '@/components/VitrinSection'
import { kategoriler } from '@/lib/kategoriler'
import { Home, Zap, ArrowRight, TrendingUp } from 'lucide-react'

export const revalidate = 60 // Her 60 saniyede bir yenile

async function getAnasayfaVerisi() {
  const simdi = new Date()

  const [vitrinIlanlar, anasayfaIlanlar, tumIlanlar] = await Promise.all([
    // Vitrin ilanlar
    prisma.ilan.findMany({
      where: {
        durum: 'AKTIF',
        vitrin: true,
        dopingBitis: { gt: simdi },
      },
      include: {
        kullanici: { select: { id: true, ad: true, sehir: true } },
      },
      orderBy: { goruntuleme: 'desc' },
      take: 10,
    }),
    // Anasayfa pinli ilanlar
    prisma.ilan.findMany({
      where: {
        durum: 'AKTIF',
        anasayfaPin: true,
        dopingBitis: { gt: simdi },
      },
      include: {
        kullanici: { select: { id: true, ad: true, sehir: true } },
      },
      orderBy: { olusturma: 'desc' },
      take: 8,
    }),
    // Tüm aktif ilanlar
    prisma.ilan.findMany({
      where: { durum: 'AKTIF' },
      include: {
        kullanici: { select: { id: true, ad: true, sehir: true } },
      },
      orderBy: { olusturma: 'desc' },
      take: 24,
    }),
  ])

  return { vitrinIlanlar, anasayfaIlanlar, tumIlanlar }
}

export default async function AnaSayfa() {
  const { vitrinIlanlar, anasayfaIlanlar, tumIlanlar } = await getAnasayfaVerisi()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-400 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Teknolojinin Buluşma Noktası ⚡
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            Binlerce teknoloji ilanı, güvenli alım satım, hızlı teslimat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ilan/yeni"
              className="flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              + İlan Ver
            </Link>
            <Link
              href="/ara"
              className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              🔍 İlan Ara
            </Link>
          </div>
        </div>
        {/* Dekoratif elementler */}
        <div className="absolute right-8 top-4 text-9xl opacity-10 pointer-events-none">💻</div>
        <div className="absolute right-32 bottom-4 text-6xl opacity-10 pointer-events-none">🎮</div>
        <div className="absolute right-64 top-8 text-5xl opacity-10 pointer-events-none">📱</div>
      </div>

      {/* Kategoriler (hızlı erişim) */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Kategoriler</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {kategoriler.map((kat) => (
            <Link
              key={kat.id}
              href={`/kategori/${kat.slug}`}
              className="flex flex-col items-center gap-1.5 bg-white p-3 rounded-2xl shadow-card hover:shadow-card-hover hover:bg-blue-50 transition-all group text-center"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {kat.ikon}
              </span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600 leading-tight">
                {kat.ad}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrin İlanlar */}
      {vitrinIlanlar.length > 0 && (
        <VitrinSection ilanlar={vitrinIlanlar} />
      )}

      {/* Anasayfa Pinli İlanlar */}
      {anasayfaIlanlar.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-violet-500 p-1.5 rounded-lg">
                <Home size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Anasayfada Öne Çıkan</h2>
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Sponsorlu
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {anasayfaIlanlar.map((ilan: IlanTip) => (
              <IlanKarti key={ilan.id} ilan={ilan} />
            ))}
          </div>
        </section>
      )}

      {/* Tüm İlanlar */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Son İlanlar</h2>
          </div>
          <Link
            href="/ara"
            className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:underline"
          >
            Tümünü Gör
            <ArrowRight size={14} />
          </Link>
        </div>

        {tumIlanlar.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tumIlanlar.map((ilan: IlanTip) => (
              <IlanKarti key={ilan.id} ilan={ilan} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-lg font-medium">Henüz ilan bulunmuyor.</p>
            <p className="text-sm mt-1">İlk ilanı sen ver!</p>
            <Link href="/ilan/yeni" className="btn-primary mt-4 inline-block">
              İlan Ver
            </Link>
          </div>
        )}
      </section>

      {/* Doping Tanıtım Banner */}
      <div className="mt-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={28} className="text-white" />
          <h2 className="text-2xl font-black text-white">İlanınıza Doping Aldırın!</h2>
        </div>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Vitrin ilanı, anasayfa sabitleme ve renkli yazı ile ilanınız daha fazla kişiye ulaşsın.
          Satışlarınızı katlayın!
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 text-white text-sm font-bold">
            ⭐ Vitrin İlanı<br/>
            <span className="text-xs font-normal opacity-90">7 gün 79,99₺</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 text-white text-sm font-bold">
            🏠 Anasayfa<br/>
            <span className="text-xs font-normal opacity-90">7 gün 129,99₺</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 text-white text-sm font-bold">
            🚀 Süper Doping<br/>
            <span className="text-xs font-normal opacity-90">15 gün 199,99₺</span>
          </div>
        </div>
        <Link
          href="/doping"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-lg hover:bg-blue-50 transition-colors shadow-lg"
        >
          Doping Paketleri →
        </Link>
      </div>
    </div>
  )
}
