'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Zap, Star, Home, Check, Crown, ArrowRight, Package, Clock
} from 'lucide-react'

interface Paket {
  id: string
  ad: string
  aciklama: string
  fiyat: number
  gun: number
  vitrin: boolean
  anasayfa: boolean
  renkliYazi: boolean
  kalinYazi: boolean
  populer: boolean
  renk: string
}

interface Ilan {
  id: string
  baslik: string
  fiyat: number
  sehir: string
}

const renkler: Record<string, { bg: string; border: string; text: string; badge: string; btn: string }> = {
  blue: {
    bg: 'from-blue-50 to-white',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  amber: {
    bg: 'from-amber-50 to-white',
    border: 'border-amber-300',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    btn: 'bg-amber-400 hover:bg-amber-500 text-amber-900',
  },
  purple: {
    bg: 'from-violet-50 to-white',
    border: 'border-violet-300',
    text: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'bg-violet-500 hover:bg-violet-600 text-white',
  },
  pink: {
    bg: 'from-pink-50 to-white',
    border: 'border-pink-300',
    text: 'text-pink-600',
    badge: 'bg-pink-100 text-pink-700',
    btn: 'bg-pink-500 hover:bg-pink-600 text-white',
  },
}

export default function DopingPage() {
  const { data: session, status } = useSession()
  const [paketler, setPaketler] = useState<Paket[]>([])
  const [ilanlar, setIlanlar] = useState<Ilan[]>([])
  const [secilenIlan, setSecilenIlan] = useState('')
  const [secilenPaket, setSecilenPaket] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [adim, setAdim] = useState<'secim' | 'onay' | 'basarili'>('secim')

  useEffect(() => {
    fetch('/api/doping')
      .then((r) => r.json())
      .then((d) => setPaketler(d.paketler || []))
  }, [])

  useEffect(() => {
    if (session) {
      fetch('/api/kullanici')
        .then((r) => r.json())
        .then((d) => {
          const aktifIlanlar = (d.kullanici?.ilanlar || []).filter(
            (i: { durum: string }) => i.durum === 'AKTIF'
          )
          setIlanlar(aktifIlanlar)
        })
    }
  }, [session])

  const secilenPaketObj = paketler.find((p) => p.id === secilenPaket)
  const secilenIlanObj = ilanlar.find((i) => i.id === secilenIlan)

  const handleSatinAl = async () => {
    if (!secilenIlan || !secilenPaket) {
      toast.error('Lütfen ilan ve paket seçin.')
      return
    }

    setYukleniyor(true)
    try {
      const yanit = await fetch('/api/doping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ilanId: secilenIlan, paketId: secilenPaket }),
      })
      const json = await yanit.json()

      if (!yanit.ok) {
        toast.error(json.hata || 'Doping uygulanamadı.')
      } else {
        setAdim('basarili')
        toast.success(json.mesaj || 'Doping başarıyla uygulandı!')
      }
    } catch {
      toast.error('Bir hata oluştu.')
    } finally {
      setYukleniyor(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Doping Almak İçin Giriş Yapın</h1>
        <p className="text-gray-500 mb-6">İlanlarınıza doping almak için hesabınıza giriş yapın.</p>
        <Link href="/giris" className="btn-primary">
          Giriş Yap
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Zap size={14} />
          Doping Paketleri
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          İlanınızı Öne Çıkarın
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Vitrin ilanı, anasayfa sabitleme ve renkli yazı dopingleri ile
          ilanınız daha fazla kişiye ulaşsın.
        </p>
      </div>

      {adim === 'basarili' ? (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Doping Başarıyla Uygulandı! 🎉</h2>
          <p className="text-gray-500 mb-8">
            İlanınız artık {secilenPaketObj?.gun} gün boyunca öne çıkacak.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/ilan/${secilenIlan}`} className="btn-primary">
              İlanı Görüntüle
            </Link>
            <button onClick={() => { setAdim('secim'); setSecilenIlan(''); setSecilenPaket('') }} className="btn-secondary">
              Başka Doping Al
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Paket Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {paketler.map((paket) => {
              const r = renkler[paket.renk] || renkler.blue
              const secili = secilenPaket === paket.id
              return (
                <div
                  key={paket.id}
                  onClick={() => setSecilenPaket(paket.id)}
                  className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all bg-gradient-to-b ${r.bg} ${
                    secili ? `${r.border} shadow-lg scale-105` : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {paket.populer && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`${r.badge} text-xs font-black px-3 py-1 rounded-full flex items-center gap-1`}>
                        <Crown size={10} />
                        EN POPÜLER
                      </span>
                    </div>
                  )}

                  <div className={`text-3xl font-black ${r.text} mb-1`}>
                    {paket.fiyat.toFixed(2)} ₺
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-1">{paket.ad}</h3>
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <Clock size={11} />
                    {paket.gun} gün boyunca aktif
                  </p>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{paket.aciklama}</p>

                  <ul className="space-y-2 mb-6">
                    {paket.vitrin && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-green-500 shrink-0" />
                        Vitrin bölümünde gösterilir
                      </li>
                    )}
                    {paket.anasayfa && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-green-500 shrink-0" />
                        Anasayfada sabitlenir
                      </li>
                    )}
                    {paket.renkliYazi && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-green-500 shrink-0" />
                        <span className="text-blue-500 font-semibold">Renkli başlık</span>
                      </li>
                    )}
                    {paket.kalinYazi && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-green-500 shrink-0" />
                        <span className="font-bold">Kalın başlık</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-green-500 shrink-0" />
                      Arama sonuçlarında üstte
                    </li>
                  </ul>

                  <button
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${r.btn} ${
                      secili ? 'ring-2 ring-offset-2 ring-current' : ''
                    }`}
                  >
                    {secili ? '✓ Seçildi' : 'Seç'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* İlan Seçimi + Satın Al */}
          {session && (
            <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="font-black text-gray-800 text-xl mb-6 text-center">
                Dopingi Hangi İlana Uygulayalım?
              </h2>

              {ilanlar.length === 0 ? (
                <div className="text-center py-6">
                  <Package size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">Aktif ilanınız bulunmuyor.</p>
                  <Link href="/ilan/yeni" className="btn-primary">
                    İlan Ver
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-6">
                    {ilanlar.map((ilan) => (
                      <button
                        key={ilan.id}
                        onClick={() => setSecilenIlan(ilan.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          secilenIlan === ilan.id
                            ? 'border-primary-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`font-semibold text-sm ${secilenIlan === ilan.id ? 'text-primary-600' : 'text-gray-800'}`}>
                          {ilan.baslik.substring(0, 60)}{ilan.baslik.length > 60 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{ilan.sehir}</p>
                      </button>
                    ))}
                  </div>

                  {/* Özet */}
                  {secilenPaketObj && secilenIlanObj && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Paket:</span>
                        <span className="font-bold">{secilenPaketObj.ad}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Süre:</span>
                        <span className="font-bold">{secilenPaketObj.gun} gün</span>
                      </div>
                      <div className="flex justify-between text-base border-t border-gray-200 pt-2 mt-2">
                        <span className="font-bold text-gray-800">Toplam:</span>
                        <span className="font-black text-primary-600">{secilenPaketObj.fiyat.toFixed(2)} ₺</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!secilenIlan || !secilenPaket) {
                        toast.error('Lütfen ilan ve paket seçin.')
                        return
                      }
                      handleSatinAl()
                    }}
                    disabled={yukleniyor || !secilenIlan || !secilenPaket}
                    className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white font-black py-4 rounded-2xl transition-colors text-base"
                  >
                    {yukleniyor ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Zap size={20} />
                    )}
                    {yukleniyor ? 'İşleniyor...' : `Dopingi Uygula${secilenPaketObj ? ` - ${secilenPaketObj.fiyat.toFixed(2)} ₺` : ''}`}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    * Bu demo modda ödeme simülasyonu yapılmaktadır.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Özellik karşılaştırması */}
      <div className="mt-16">
        <h2 className="text-2xl font-black text-gray-800 text-center mb-8">
          Doping Özellikleri Karşılaştırması
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-card overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-4 text-gray-500 font-bold">Özellik</th>
                {paketler.map((p) => (
                  <th key={p.id} className="px-4 py-4 text-center">
                    <div className={`font-black ${renkler[p.renk]?.text || 'text-gray-800'}`}>{p.ad}</div>
                    <div className="text-gray-500 text-xs font-normal">{p.fiyat.toFixed(2)} ₺</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'vitrin', label: '⭐ Vitrin Bölümü' },
                { key: 'anasayfa', label: '🏠 Anasayfa Sabitlenir' },
                { key: 'renkliYazi', label: '🟠 Renkli Başlık' },
                { key: 'kalinYazi', label: '𝐁 Kalın Başlık' },
              ].map((ozellik, i) => (
                <tr key={ozellik.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-3 font-medium text-gray-700">{ozellik.label}</td>
                  {paketler.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center">
                      {p[ozellik.key as keyof Paket] ? (
                        <Check size={18} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-700">⏱️ Süre</td>
                {paketler.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-center font-bold text-gray-700">
                    {p.gun} gün
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
