'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import IlanKarti from '@/components/IlanKarti'
import { kategoriler } from '@/lib/kategoriler'
import { buyukSehirler } from '@/lib/sehirler'

interface Ilan {
  id: string
  baslik: string
  fiyat: number
  sehir: string
  ilce: string | null
  resimler: string
  durum: string
  goruntuleme: number
  vitrin: boolean
  anasayfaPin: boolean
  renkliYazi: boolean
  kalinYazi: boolean
  dopingBitis: string | null
  olusturma: string
  kategori: string
  kullanici: {
    id: string
    ad: string
    sehir: string | null
  }
}

interface ApiCevap {
  ilanlar: Ilan[]
  toplam: number
  sayfa: number
  toplamSayfa: number
}

const siralama_secenekleri = [
  { value: 'yeni', label: 'En Yeni' },
  { value: 'eski', label: 'En Eski' },
  { value: 'ucuz', label: 'En Ucuz' },
  { value: 'pahali', label: 'En Pahalı' },
  { value: 'populer', label: 'En Çok Görüntülenen' },
]

function AraIcerik() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [veri, setVeri] = useState<ApiCevap | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [filtrePaneli, setFiltrePaneli] = useState(false)

  const q = searchParams.get('q') || ''
  const kategori = searchParams.get('kategori') || ''
  const sehir = searchParams.get('sehir') || ''
  const minFiyat = searchParams.get('minFiyat') || ''
  const maxFiyat = searchParams.get('maxFiyat') || ''
  const siralama = searchParams.get('siralama') || 'yeni'
  const sayfa = Number(searchParams.get('sayfa') || 1)

  // Geçici filtre durumu
  const [tempFiltre, setTempFiltre] = useState({ kategori, sehir, minFiyat, maxFiyat })

  useEffect(() => {
    setTempFiltre({ kategori, sehir, minFiyat, maxFiyat })
  }, [kategori, sehir, minFiyat, maxFiyat])

  useEffect(() => {
    setYukleniyor(true)
    const params = new URLSearchParams()
    if (q) params.set('arama', q)
    if (kategori) params.set('kategori', kategori)
    if (sehir) params.set('sehir', sehir)
    if (minFiyat) params.set('minFiyat', minFiyat)
    if (maxFiyat) params.set('maxFiyat', maxFiyat)
    params.set('siralama', siralama)
    params.set('sayfa', String(sayfa))
    params.set('limit', '24')

    fetch(`/api/ilanlar?${params}`)
      .then((r) => r.json())
      .then((d) => setVeri(d))
      .finally(() => setYukleniyor(false))
  }, [q, kategori, sehir, minFiyat, maxFiyat, siralama, sayfa])

  const updateParam = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString())
    if (value) current.set(key, value)
    else current.delete(key)
    current.delete('sayfa')
    router.push(`/ara?${current}`)
  }

  const uygulaFiltre = () => {
    const current = new URLSearchParams(searchParams.toString())
    if (tempFiltre.kategori) current.set('kategori', tempFiltre.kategori)
    else current.delete('kategori')
    if (tempFiltre.sehir) current.set('sehir', tempFiltre.sehir)
    else current.delete('sehir')
    if (tempFiltre.minFiyat) current.set('minFiyat', tempFiltre.minFiyat)
    else current.delete('minFiyat')
    if (tempFiltre.maxFiyat) current.set('maxFiyat', tempFiltre.maxFiyat)
    else current.delete('maxFiyat')
    current.delete('sayfa')
    router.push(`/ara?${current}`)
    setFiltrePaneli(false)
  }

  const filtreTemizle = () => {
    const current = new URLSearchParams()
    if (q) current.set('q', q)
    router.push(`/ara?${current}`)
    setFiltrePaneli(false)
  }

  const aktifFiltreSayisi = [kategori, sehir, minFiyat, maxFiyat].filter(Boolean).length

  const sayfalama = (hedef: number) => {
    const current = new URLSearchParams(searchParams.toString())
    current.set('sayfa', String(hedef))
    return `/ara?${current}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Arama Başlığı */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 mb-1">
          {q ? (
            <>
              &quot;<span className="text-primary-600">{q}</span>&quot; için arama sonuçları
            </>
          ) : (
            'Tüm İlanlar'
          )}
        </h1>
        {veri && !yukleniyor && (
          <p className="text-gray-500 text-sm">
            {veri.toplam} ilan bulundu
            {aktifFiltreSayisi > 0 && (
              <button onClick={filtreTemizle} className="ml-3 text-primary-500 hover:text-primary-700 font-medium">
                Filtreleri Temizle ({aktifFiltreSayisi})
              </button>
            )}
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sol: Filtreler (masaüstü) */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-5 space-y-6">
            {/* Kategori */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm">Kategori</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('kategori', '')}
                  className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                    !kategori ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tüm Kategoriler
                </button>
                {kategoriler.map((k) => (
                  <button
                    key={k.slug}
                    onClick={() => updateParam('kategori', k.slug)}
                    className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                      kategori === k.slug ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{k.ikon}</span>
                    {k.ad}
                  </button>
                ))}
              </div>
            </div>

            {/* Şehir */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm">Şehir</h3>
              <select
                value={sehir}
                onChange={(e) => updateParam('sehir', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Tüm Şehirler</option>
                {buyukSehirler.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Fiyat */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm">Fiyat Aralığı (₺)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minFiyat}
                  onChange={(e) => updateParam('minFiyat', e.target.value)}
                  className="input-field text-sm w-full"
                  min={0}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxFiyat}
                  onChange={(e) => updateParam('maxFiyat', e.target.value)}
                  className="input-field text-sm w-full"
                  min={0}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Sağ: Sonuçlar */}
        <div className="flex-1 min-w-0">
          {/* Mobil Filtre + Sıralama */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={() => setFiltrePaneli(true)}
              className="lg:hidden flex items-center gap-2 btn-secondary relative"
            >
              <SlidersHorizontal size={16} />
              Filtrele
              {aktifFiltreSayisi > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {aktifFiltreSayisi}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-500 hidden sm:block">Sırala:</label>
              <select
                value={siralama}
                onChange={(e) => updateParam('siralama', e.target.value)}
                className="input-field text-sm py-2 max-w-[160px]"
              >
                {siralama_secenekleri.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Aktif Filtre Etiketleri */}
          {aktifFiltreSayisi > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {kategori && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {kategoriler.find(k => k.slug === kategori)?.ad || kategori}
                  <button onClick={() => updateParam('kategori', '')}><X size={12} /></button>
                </span>
              )}
              {sehir && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {sehir}
                  <button onClick={() => updateParam('sehir', '')}><X size={12} /></button>
                </span>
              )}
              {(minFiyat || maxFiyat) && (
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {minFiyat || '0'} — {maxFiyat || '∞'} ₺
                  <button onClick={() => { updateParam('minFiyat', ''); updateParam('maxFiyat', '') }}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Sonuçlar */}
          {yukleniyor ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card animate-pulse">
                  <div className="h-44 bg-gray-200 rounded-t-2xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : veri && veri.ilanlar.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {veri.ilanlar.map((ilan) => (
                  <IlanKarti key={ilan.id} ilan={ilan} />
                ))}
              </div>

              {/* Sayfalama */}
              {veri.toplamSayfa > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {sayfa > 1 && (
                    <Link href={sayfalama(sayfa - 1)} className="btn-secondary py-2 px-4">
                      ← Önceki
                    </Link>
                  )}
                  {Array.from({ length: veri.toplamSayfa }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - sayfa) <= 2)
                    .map((p) => (
                      <Link
                        key={p}
                        href={sayfalama(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium text-sm transition-colors ${
                          p === sayfa
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-600 shadow-card hover:bg-primary-50'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  {sayfa < veri.toplamSayfa && (
                    <Link href={sayfalama(sayfa + 1)} className="btn-secondary py-2 px-4">
                      Sonraki →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold mb-2">Sonuç Bulunamadı</p>
              <p className="text-sm">
                {q
                  ? `"${q}" için ilan bulunamadı. Farklı bir arama terimi deneyin.`
                  : 'Bu kriterlere uygun ilan bulunamadı.'}
              </p>
              {aktifFiltreSayisi > 0 && (
                <button onClick={filtreTemizle} className="btn-primary mt-4">
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobil Filtre Paneli */}
      {filtrePaneli && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltrePaneli(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Filtrele</h2>
              <button onClick={() => setFiltrePaneli(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label">Kategori</label>
                <select
                  value={tempFiltre.kategori}
                  onChange={(e) => setTempFiltre({ ...tempFiltre, kategori: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tüm Kategoriler</option>
                  {kategoriler.map((k) => <option key={k.slug} value={k.slug}>{k.ikon} {k.ad}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Şehir</label>
                <select
                  value={tempFiltre.sehir}
                  onChange={(e) => setTempFiltre({ ...tempFiltre, sehir: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tüm Şehirler</option>
                  {buyukSehirler.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Fiyat Aralığı (₺)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={tempFiltre.minFiyat}
                    onChange={(e) => setTempFiltre({ ...tempFiltre, minFiyat: e.target.value })}
                    className="input-field"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={tempFiltre.maxFiyat}
                    onChange={(e) => setTempFiltre({ ...tempFiltre, maxFiyat: e.target.value })}
                    className="input-field"
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={filtreTemizle} className="btn-secondary flex-1">Temizle</button>
              <button onClick={uygulaFiltre} className="btn-primary flex-1">Uygula</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AraPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      }
    >
      <AraIcerik />
    </Suspense>
  )
}
