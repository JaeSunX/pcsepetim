'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface IlanDetayClientProps {
  resimler: string[]
  ilanBaslik: string
}

export default function IlanDetayClient({ resimler, ilanBaslik }: IlanDetayClientProps) {
  const [aktifIndex, setAktifIndex] = useState(0)
  const [lightboxAcik, setLightboxAcik] = useState(false)

  const onceki = () => setAktifIndex((p) => (p === 0 ? resimler.length - 1 : p - 1))
  const sonraki = () => setAktifIndex((p) => (p === resimler.length - 1 ? 0 : p + 1))

  return (
    <>
      {/* Ana Galeri */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Büyük resim */}
        <div
          className="relative w-full cursor-zoom-in"
          style={{ paddingBottom: '66.67%' }}
          onClick={() => setLightboxAcik(true)}
        >
          <Image
            src={resimler[aktifIndex]}
            alt={ilanBaslik}
            fill
            className="object-contain bg-gray-50"
            unoptimized={resimler[aktifIndex].startsWith('https://picsum')}
            priority
          />

          {/* Gezinme okları */}
          {resimler.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onceki() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-colors z-10"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); sonraki() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-colors z-10"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </>
          )}

          {/* Sayaç */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {aktifIndex + 1} / {resimler.length}
          </div>
        </div>

        {/* Thumbnail şeridi */}
        {resimler.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
            {resimler.map((url, i) => (
              <button
                key={i}
                onClick={() => setAktifIndex(i)}
                className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === aktifIndex ? 'border-primary-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={url.startsWith('https://picsum')}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxAcik && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxAcik(false)}
        >
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 z-10"
            onClick={() => setLightboxAcik(false)}
          >
            <X size={24} />
          </button>

          {resimler.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onceki() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 z-10"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); sonraki() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 z-10"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resimler[aktifIndex]}
              alt={ilanBaslik}
              fill
              className="object-contain"
              unoptimized={resimler[aktifIndex].startsWith('https://picsum')}
            />
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {aktifIndex + 1} / {resimler.length}
          </p>
        </div>
      )}
    </>
  )
}
