import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'
import { formatFiyat, parseResimler } from '@/lib/utils'

interface VitrinIlan {
  id: string
  baslik: string
  fiyat: number
  sehir: string
  resimler: string
  kullanici: { ad: string }
}

interface VitrinSectionProps {
  ilanlar: VitrinIlan[]
}

export default function VitrinSection({ ilanlar }: VitrinSectionProps) {
  if (!ilanlar.length) return null

  return (
    <section className="mb-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-amber-400 p-1.5 rounded-lg">
            <Star size={16} className="text-amber-900" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Vitrin İlanlar</h2>
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {ilanlar.length} ilan
          </span>
        </div>
        <Link
          href="/ara?vitrin=1"
          className="text-primary-600 text-sm font-medium hover:underline"
        >
          Tümünü gör →
        </Link>
      </div>

      {/* Vitrin grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {ilanlar.map((ilan) => {
          const resimler = parseResimler(ilan.resimler)
          return (
            <Link key={ilan.id} href={`/ilan/${ilan.id}`} className="block group">
              <div className="bg-white rounded-2xl overflow-hidden ring-2 ring-amber-400 shadow-vitrin transition-all hover:-translate-y-0.5">
                {/* Rozet */}
                <div className="px-3 pt-2.5">
                  <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full w-fit">
                    <Star size={9} />
                    VİTRİN
                  </span>
                </div>

                {/* Resim */}
                <div className="relative h-36 mt-1.5">
                  <Image
                    src={resimler[0]}
                    alt={ilan.baslik}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={resimler[0].startsWith('https://picsum')}
                  />
                </div>

                {/* İçerik */}
                <div className="p-3 bg-gradient-to-b from-amber-50/50 to-white">
                  <p className="text-primary-600 font-black text-base">{formatFiyat(ilan.fiyat)}</p>
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mt-0.5 leading-tight">
                    {ilan.baslik}
                  </h3>
                  <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5">
                    <MapPin size={10} />
                    {ilan.sehir}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
