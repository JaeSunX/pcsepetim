import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Eye, Clock, Star, Zap, Home, Bold } from 'lucide-react'
import { formatFiyat, formatTarih, parseResimler, dopingAktifMi, cn } from '@/lib/utils'

interface IlanKartiProps {
  ilan: {
    id: string
    baslik: string
    fiyat: number
    sehir: string
    ilce?: string | null
    olusturma: Date | string
    resimler: string
    vitrin: boolean
    anasayfaPin: boolean
    renkliYazi: boolean
    kalinYazi: boolean
    dopingBitis?: Date | string | null
    goruntuleme: number
    kullanici: {
      id: string
      ad: string
      sehir?: string | null
    }
  }
  buyuk?: boolean
}

export default function IlanKarti({ ilan, buyuk = false }: IlanKartiProps) {
  const resimler = parseResimler(ilan.resimler)
  const ilkResim = resimler[0]
  const dopingAktif = dopingAktifMi(ilan.dopingBitis ? new Date(ilan.dopingBitis) : null)
  const vitrinAktif = ilan.vitrin && dopingAktif
  const anasayfaAktif = ilan.anasayfaPin && dopingAktif
  const renkliAktif = ilan.renkliYazi && dopingAktif
  const kalinAktif = ilan.kalinYazi && dopingAktif

  return (
    <Link href={`/ilan/${ilan.id}`} className="block group">
      <div
        className={cn(
          'bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5',
          vitrinAktif
            ? 'shadow-vitrin ring-2 ring-amber-400'
            : anasayfaAktif
            ? 'shadow-card-hover ring-2 ring-violet-400'
            : 'shadow-card hover:shadow-card-hover',
          buyuk && 'h-full'
        )}
      >
        {/* Doping Rozetleri */}
        {(vitrinAktif || anasayfaAktif) && (
          <div className="flex gap-1 px-3 pt-3">
            {vitrinAktif && (
              <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                <Star size={10} />
                VİTRİN
              </span>
            )}
            {anasayfaAktif && (
              <span className="flex items-center gap-1 bg-violet-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                <Home size={10} />
                ANASAYFA
              </span>
            )}
            {!vitrinAktif && !anasayfaAktif && dopingAktif && (
              <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                <Zap size={10} />
                ÖNE ÇIKARILDI
              </span>
            )}
          </div>
        )}

        {/* Resim */}
        <div className={cn('relative overflow-hidden', buyuk ? 'h-52' : 'h-44')}>
          <Image
            src={ilkResim}
            alt={ilan.baslik}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={ilkResim.startsWith('https://picsum')}
          />
          {resimler.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              +{resimler.length - 1} foto
            </div>
          )}
          {/* Vitrin shimmer efekti */}
          {vitrinAktif && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-400/10 to-transparent pointer-events-none" />
          )}
        </div>

        {/* İçerik */}
        <div className="p-3">
          {/* Fiyat */}
          <p className="text-primary-600 font-black text-lg leading-tight mb-1">
            {formatFiyat(ilan.fiyat)}
          </p>

          {/* Başlık */}
          <h3
            className={cn(
              'text-sm leading-tight mb-2 line-clamp-2',
              kalinAktif ? 'font-bold' : 'font-medium',
              renkliAktif ? 'text-primary-600' : 'text-gray-800',
              'group-hover:text-primary-600 transition-colors'
            )}
          >
            {ilan.baslik}
          </h3>

          {/* Alt bilgi */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {ilan.ilce ? `${ilan.ilce}, ${ilan.sehir}` : ilan.sehir}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {ilan.goruntuleme}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatTarih(ilan.olusturma)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
