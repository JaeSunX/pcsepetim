'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { kategoriler } from '@/lib/kategoriler'
import { sehirler } from '@/lib/sehirler'
import { parseResimler } from '@/lib/utils'
import {
  Upload,
  X,
  Image as ImageIcon,
  Edit,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

const ilanSchema = z.object({
  baslik: z
    .string()
    .min(10, 'Başlık en az 10 karakter olmalıdır.')
    .max(100, 'Başlık en fazla 100 karakter olabilir.'),
  aciklama: z
    .string()
    .min(30, 'Açıklama en az 30 karakter olmalıdır.')
    .max(5000),
  fiyat: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Geçerli bir fiyat girin.',
    }),
  kategori: z.string().min(1, 'Kategori seçin.'),
  altKategori: z.string().optional(),
  sehir: z.string().min(1, 'Şehir seçin.'),
  ilce: z.string().optional(),
})

type IlanForm = z.infer<typeof ilanSchema>

export default function IlanDuzenlePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const ilanId = params.id as string

  const [resimler, setResimler] = useState<string[]>([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [resimYukleniyor, setResimYukleniyor] = useState(false)
  const [ilanYukleniyor, setIlanYukleniyor] = useState(true)
  const [ilan, setIlan] = useState<any>(null)
  const [izinVar, setIzinVar] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IlanForm>({
    resolver: zodResolver(ilanSchema),
  })

  const kategoriDegeri = watch('kategori')
  const secilenKategoriObj = kategoriler.find((k) => k.ad === kategoriDegeri)

  // İlani getir
  useEffect(() => {
    const ilanGetir = async () => {
      try {
        const response = await fetch(`/api/ilanlar/${ilanId}`)
        if (response.ok) {
          const data = await response.json()
          setIlan(data.ilan)

          // Formu doldur
          setValue('baslik', data.ilan.baslik)
          setValue('aciklama', data.ilan.aciklama)
          setValue('fiyat', data.ilan.fiyat.toString())
          setValue('kategori', data.ilan.kategori)
          setValue('altKategori', data.ilan.altKategori || '')
          setValue('sehir', data.ilan.sehir)
          setValue('ilce', data.ilan.ilce || '')

          // Resimleri ayarla
          setResimler(parseResimler(data.ilan.resimler))

          // İzin kontrolü
          if (session?.user?.email && data.ilan.kullanici.email === session.user.email) {
            setIzinVar(true)
          }
        } else {
          toast.error('İlan bulunamadı.')
          router.push('/')
        }
      } catch (error) {
        console.error('İlan getirilirken hata:', error)
        toast.error('İlan yüklenirken hata oluştu.')
        router.push('/')
      } finally {
        setIlanYukleniyor(false)
      }
    }

    if (ilanId) {
      ilanGetir()
    }
  }, [ilanId, session, setValue, router])

  const handleResimYukle = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosyalar = e.target.files
    if (!dosyalar) return

    if (resimler.length + dosyalar.length > 10) {
      toast.error('En fazla 10 fotoğraf yükleyebilirsiniz.')
      return
    }

    setResimYukleniyor(true)
    const yeniResimler: string[] = []

    for (const dosya of Array.from(dosyalar)) {
      const formData = new FormData()
      formData.append('dosya', dosya)

      try {
        const yanit = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const json = await yanit.json()
        if (json.url) {
          yeniResimler.push(json.url)
        }
      } catch {
        toast.error(`${dosya.name} yüklenemedi.`)
      }
    }

    setResimler((prev) => [...prev, ...yeniResimler])
    setResimYukleniyor(false)
    if (yeniResimler.length > 0) {
      toast.success(`${yeniResimler.length} fotoğraf yüklendi.`)
    }
  }, [resimler.length])

  const resimKaldir = (index: number) => {
    setResimler((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: IlanForm) => {
    if (resimler.length === 0) {
      toast.error('En az 1 fotoğraf yüklemeniz gerekiyor.')
      return
    }

    setYukleniyor(true)
    try {
      const yanit = await fetch(`/api/ilanlar/${ilanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fiyat: parseFloat(data.fiyat),
          resimler,
        }),
      })

      const json = await yanit.json()

      if (!yanit.ok) {
        toast.error(json.hata || 'İlan güncellenemedi.')
        return
      }

      toast.success('İlanınız başarıyla güncellendi! 🎉')
      router.push(`/ilan/${ilanId}`)
    } catch {
      toast.error('Bir hata oluştu.')
    } finally {
      setYukleniyor(false)
    }
  }

  if (status === 'loading' || ilanYukleniyor) {
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
        <p className="text-gray-500 mb-6">İlan düzenlemek için hesabınıza giriş yapın.</p>
        <Link href="/giris" className="btn-primary">
          Giriş Yap
        </Link>
      </div>
    )
  }

  if (!izinVar) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Erişim Engellendi</h1>
        <p className="text-gray-500 mb-6">Bu ilanı düzenleme yetkiniz yok.</p>
        <Link href={`/ilan/${ilanId}`} className="btn-primary">
          İlana Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İlanı Düzenle</h1>
        <p className="text-gray-500 text-sm mt-1">
          İlan bilgilerinizi güncelleyin.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fotoğraf Yükleme */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-primary-500" />
            Fotoğraflar
            <span className="text-xs font-normal text-gray-400">(En az 1, en fazla 10)</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {resimler.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image
                  src={url}
                  alt={`Resim ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary-500 text-white text-[10px] text-center py-1 font-bold">
                    ANA FOTOĞRAF
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => resimKaldir(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {resimler.length < 10 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-400 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleResimYukle}
                  className="hidden"
                  disabled={resimYukleniyor}
                />
                {resimYukleniyor ? (
                  <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={20} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                    <span className="text-xs text-gray-400 group-hover:text-primary-400">Ekle</span>
                  </>
                )}
              </label>
            )}
          </div>

          {resimler.length === 0 && (
            <label className="block border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-2xl py-10 cursor-pointer transition-colors text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleResimYukle}
                className="hidden"
                disabled={resimYukleniyor}
              />
              <Upload size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">Fotoğraf yüklemek için tıklayın</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG veya WebP · Max 10MB</p>
            </label>
          )}
        </div>

        {/* Temel Bilgiler */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Edit size={18} className="text-primary-500" />
            İlan Bilgileri
          </h2>

          <div className="space-y-4">
            {/* Başlık */}
            <div>
              <label className="label">İlan Başlığı *</label>
              <input
                {...register('baslik')}
                type="text"
                placeholder="örn: iPhone 15 Pro Max 256GB Titanyum Siyah"
                className="input-field"
              />
              {errors.baslik && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.baslik.message}
                </p>
              )}
            </div>

            {/* Kategori & Alt Kategori */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kategori *</label>
                <select {...register('kategori')} className="input-field">
                  <option value="">Kategori seçin</option>
                  {kategoriler.map((k) => (
                    <option key={k.id} value={k.ad}>{k.ad}</option>
                  ))}
                </select>
                {errors.kategori && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.kategori.message}</p>
                )}
              </div>
              <div>
                <label className="label">Alt Kategori</label>
                <select {...register('altKategori')} className="input-field">
                  <option value="">Seçin (isteğe bağlı)</option>
                  {secilenKategoriObj?.altKategoriler.map((ak) => (
                    <option key={ak.id} value={ak.ad}>{ak.ad}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fiyat */}
            <div>
              <label className="label">Fiyat (₺) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                <input
                  {...register('fiyat')}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  className="input-field pl-8"
                />
              </div>
              {errors.fiyat && (
                <p className="text-red-500 text-xs mt-1.5">{errors.fiyat.message}</p>
              )}
            </div>

            {/* Şehir & İlçe */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Şehir *</label>
                <select {...register('sehir')} className="input-field">
                  <option value="">Şehir seçin</option>
                  {sehirler.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.sehir && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.sehir.message}</p>
                )}
              </div>
              <div>
                <label className="label">İlçe (isteğe bağlı)</label>
                <input
                  {...register('ilce')}
                  type="text"
                  placeholder="İlçe adı"
                  className="input-field"
                />
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="label">İlan Açıklaması *</label>
              <textarea
                {...register('aciklama')}
                rows={6}
                placeholder="Ürününüz hakkında detaylı bilgi verin. Durum, kullanım süresi, kutu/fatura durumu, garanti bilgisi gibi detayları ekleyin."
                className="input-field resize-none"
              />
              {errors.aciklama && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.aciklama.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Gönder */}
        <div className="flex gap-3">
          <Link
            href={`/ilan/${ilanId}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors text-base"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={yukleniyor}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl transition-colors text-base"
          >
            {yukleniyor ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            {yukleniyor ? 'Güncelleniyor...' : 'İlanı Güncelle'}
          </button>
        </div>
      </form>
    </div>
  )
}