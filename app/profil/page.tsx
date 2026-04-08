'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import {
  User, MapPin, Phone, Edit3, Plus, Trash2,
  Eye, Clock, Zap, LogOut, CheckCircle
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatFiyat, formatTarih, parseResimler } from '@/lib/utils'
import { sehirler } from '@/lib/sehirler'

interface IlanItem {
  id: string
  baslik: string
  fiyat: number
  sehir: string
  resimler: string
  durum: string
  goruntuleme: number
  vitrin: boolean
  anasayfaPin: boolean
  renkliYazi: boolean
  kalinYazi: boolean
  dopingBitis: string | null
  olusturma: string
}

interface Kullanici {
  id: string
  email: string
  ad: string
  telefon: string | null
  sehir: string | null
  biyografi: string | null
  ilanlar: IlanItem[]
}

function ProfilIcerik() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const aktifTab = searchParams.get('tab') || 'profil'
  const [kullanici, setKullanici] = useState<Kullanici | null>(null)
  const [duzenlemeModu, setDuzenlemeModu] = useState(false)
  const [form, setForm] = useState({ ad: '', telefon: '', sehir: '', biyografi: '' })
  const [yukleniyor, setYukleniyor] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/kullanici')
        .then((r) => r.json())
        .then((d) => {
          if (d.kullanici) {
            setKullanici(d.kullanici)
            setForm({
              ad: d.kullanici.ad || '',
              telefon: d.kullanici.telefon || '',
              sehir: d.kullanici.sehir || '',
              biyografi: d.kullanici.biyografi || '',
            })
          }
        })
    }
  }, [session])

  const handleKaydet = async () => {
    setYukleniyor(true)
    try {
      const yanit = await fetch('/api/kullanici', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (yanit.ok) {
        toast.success('Profil güncellendi.')
        setKullanici((prev) => prev ? { ...prev, ...form } : null)
        setDuzenlemeModu(false)
      } else {
        toast.error('Güncelleme başarısız.')
      }
    } catch {
      toast.error('Hata oluştu.')
    } finally {
      setYukleniyor(false)
    }
  }

  const handleIlanSil = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return
    try {
      const yanit = await fetch(`/api/ilanlar/${id}`, { method: 'DELETE' })
      if (yanit.ok) {
        toast.success('İlan silindi.')
        setKullanici((prev) =>
          prev ? { ...prev, ilanlar: prev.ilanlar.filter((i) => i.id !== id) } : null
        )
      }
    } catch {
      toast.error('Silme işlemi başarısız.')
    }
  }

  const handleDurumDegistir = async (id: string, yeniDurum: string) => {
    try {
      const yanit = await fetch(`/api/ilanlar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum: yeniDurum }),
      })
      if (yanit.ok) {
        toast.success(`İlan durumu "${yeniDurum}" olarak güncellendi.`)
        setKullanici((prev) =>
          prev
            ? { ...prev, ilanlar: prev.ilanlar.map((i) => i.id === id ? { ...i, durum: yeniDurum } : i) }
            : null
        )
      }
    } catch {
      toast.error('Güncelleme başarısız.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Giriş Yapmanız Gerekiyor</h1>
        <Link href="/giris" className="btn-primary">Giriş Yap</Link>
      </div>
    )
  }

  const aktifIlanlar = kullanici?.ilanlar.filter((i) => i.durum === 'AKTIF') || []
  const pasifIlanlar = kullanici?.ilanlar.filter((i) => i.durum !== 'AKTIF') || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol: Profil Bilgileri */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-6">
            {/* Avatar */}
            <div className="text-center mb-5">
              <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User size={36} className="text-primary-500" />
              </div>
              <h2 className="font-black text-xl text-gray-800">{kullanici?.ad}</h2>
              <p className="text-gray-400 text-sm">{kullanici?.email}</p>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-primary-600">{aktifIlanlar.length}</p>
                <p className="text-xs text-gray-500">Aktif İlan</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-gray-700">
                  {kullanici?.ilanlar.reduce((a, i) => a + i.goruntuleme, 0) || 0}
                </p>
                <p className="text-xs text-gray-500">Görüntülenme</p>
              </div>
            </div>

            {/* Navigasyon */}
            <nav className="space-y-1">
              {[
                { tab: 'profil', label: 'Profil Bilgileri', icon: User },
                { tab: 'ilanlar', label: 'İlanlarım', icon: Plus },
              ].map(({ tab, label, icon: Icon }) => (
                <Link
                  key={tab}
                  href={`/profil?tab=${tab}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    aktifTab === tab
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <Link
                href="/ilan/yeni"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
                Yeni İlan Ver
              </Link>
              <Link
                href="/doping"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <Zap size={16} />
                Doping Al
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut size={16} />
                Çıkış Yap
              </button>
            </nav>
          </div>
        </aside>

        {/* Sağ: İçerik */}
        <div className="flex-1 min-w-0">
          {aktifTab === 'profil' ? (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-800">Profil Bilgileri</h1>
                <button
                  onClick={() => setDuzenlemeModu(!duzenlemeModu)}
                  className="flex items-center gap-2 text-primary-600 hover:bg-blue-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit3 size={14} />
                  {duzenlemeModu ? 'İptal' : 'Düzenle'}
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Ad Soyad', key: 'ad', type: 'text' },
                  { label: 'Telefon', key: 'telefon', type: 'tel' },
                  { label: 'Biyografi', key: 'biyografi', type: 'textarea' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    {duzenlemeModu ? (
                      type === 'textarea' ? (
                        <textarea
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          rows={3}
                          className="input-field resize-none"
                        />
                      ) : (
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="input-field"
                        />
                      )
                    ) : (
                      <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm">
                        {kullanici?.[key as keyof Kullanici] as string || '—'}
                      </p>
                    )}
                  </div>
                ))}

                {/* Şehir */}
                <div>
                  <label className="label">Şehir</label>
                  {duzenlemeModu ? (
                    <select
                      value={form.sehir}
                      onChange={(e) => setForm({ ...form, sehir: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Şehir seçin</option>
                      {sehirler.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm">
                      {kullanici?.sehir || '—'}
                    </p>
                  )}
                </div>

                {duzenlemeModu && (
                  <button
                    onClick={handleKaydet}
                    disabled={yukleniyor}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {yukleniyor ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Kaydet
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                  İlanlarım ({kullanici?.ilanlar.length || 0})
                </h1>
                <Link href="/ilan/yeni" className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={14} />
                  Yeni İlan
                </Link>
              </div>

              <div className="space-y-3">
                {kullanici?.ilanlar.map((ilan) => {
                  const resimler = parseResimler(ilan.resimler)
                  const dopingAktif = ilan.dopingBitis && new Date(ilan.dopingBitis) > new Date()
                  return (
                    <div
                      key={ilan.id}
                      className="bg-white rounded-2xl shadow-card p-4 flex gap-4 items-start"
                    >
                      {/* Resim */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={resimler[0]}
                          alt={ilan.baslik}
                          fill
                          className="object-cover"
                          unoptimized={resimler[0].startsWith('https://picsum')}
                        />
                      </div>

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <Link
                            href={`/ilan/${ilan.id}`}
                            className="font-bold text-gray-800 hover:text-primary-600 text-sm line-clamp-1 flex-1"
                          >
                            {ilan.baslik}
                          </Link>
                          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                            ilan.durum === 'AKTIF' ? 'bg-green-100 text-green-700' :
                            ilan.durum === 'SATILDI' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {ilan.durum}
                          </span>
                        </div>
                        <p className="text-primary-600 font-black text-base">{formatFiyat(ilan.fiyat)}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye size={11} />{ilan.goruntuleme}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{formatTarih(ilan.olusturma)}</span>
                          {dopingAktif && (
                            <span className="flex items-center gap-1 text-amber-500 font-medium">
                              <Zap size={11} />Doping Aktif
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {ilan.durum === 'AKTIF' ? (
                          <button
                            onClick={() => handleDurumDegistir(ilan.id, 'SATILDI')}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Satıldı
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDurumDegistir(ilan.id, 'AKTIF')}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Aktif Et
                          </button>
                        )}
                        <button
                          onClick={() => handleIlanSil(ilan.id)}
                          className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={11} />
                          Sil
                        </button>
                      </div>
                    </div>
                  )
                })}

                {(!kullanici?.ilanlar || kullanici.ilanlar.length === 0) && (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-lg font-medium">Henüz ilanınız bulunmuyor.</p>
                    <Link href="/ilan/yeni" className="btn-primary mt-4 inline-block">
                      İlk İlanı Ver
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default function ProfilPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ProfilIcerik />
    </Suspense>
  )
}