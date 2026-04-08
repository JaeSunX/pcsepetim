'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, UserPlus } from 'lucide-react'
import { sehirler } from '@/lib/sehirler'

const kayitSchema = z.object({
  ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır.').max(50),
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  sifre: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
  sifreTekrar: z.string(),
  telefon: z.string().optional(),
  sehir: z.string().optional(),
}).refine((data) => data.sifre === data.sifreTekrar, {
  message: 'Şifreler eşleşmiyor.',
  path: ['sifreTekrar'],
})

type KayitForm = z.infer<typeof kayitSchema>

export default function KayitPage() {
  const router = useRouter()
  const [sifreGorunur, setSifreGorunur] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KayitForm>({
    resolver: zodResolver(kayitSchema),
  })

  const onSubmit = async (data: KayitForm) => {
    setYukleniyor(true)
    try {
      const yanit = await fetch('/api/kullanici', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: data.ad,
          email: data.email,
          sifre: data.sifre,
          telefon: data.telefon,
          sehir: data.sehir,
        }),
      })

      const json = await yanit.json()

      if (!yanit.ok) {
        toast.error(json.hata || 'Kayıt başarısız.')
        return
      }

      // Otomatik giriş yap
      const giris = await signIn('credentials', {
        email: data.email,
        sifre: data.sifre,
        redirect: false,
      })

      if (!giris?.error) {
        toast.success('Hesabınız oluşturuldu! Hoş geldiniz 🎉')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('Bir hata oluştu.')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <span>
              <span className="text-primary-600 font-black text-3xl">Tekno</span>
              <span className="text-gray-800 font-black text-3xl">el</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Ücretsiz Hesap Oluşturun</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="text-primary-600 font-semibold hover:underline">
              Giriş yapın
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Ad Soyad */}
            <div>
              <label className="label">Ad Soyad *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('ad')}
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="input-field pl-10"
                  autoComplete="name"
                />
              </div>
              {errors.ad && <p className="text-red-500 text-xs mt-1.5">{errors.ad.message}</p>}
            </div>

            {/* E-posta */}
            <div>
              <label className="label">E-posta Adresi *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ornek@email.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Şifre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Şifre *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('sifre')}
                    type={sifreGorunur ? 'text' : 'password'}
                    placeholder="En az 6 karakter"
                    className="input-field pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setSifreGorunur(!sifreGorunur)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {sifreGorunur ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.sifre && <p className="text-red-500 text-xs mt-1.5">{errors.sifre.message}</p>}
              </div>
              <div>
                <label className="label">Şifre Tekrar *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('sifreTekrar')}
                    type={sifreGorunur ? 'text' : 'password'}
                    placeholder="Şifreyi tekrar girin"
                    className="input-field pl-10"
                    autoComplete="new-password"
                  />
                </div>
                {errors.sifreTekrar && <p className="text-red-500 text-xs mt-1.5">{errors.sifreTekrar.message}</p>}
              </div>
            </div>

            {/* Telefon & Şehir */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Telefon (isteğe bağlı)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('telefon')}
                    type="tel"
                    placeholder="0532 xxx xx xx"
                    className="input-field pl-10"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div>
                <label className="label">Şehir (isteğe bağlı)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select {...register('sehir')} className="input-field pl-10">
                    <option value="">Şehir seçin</option>
                    {sehirler.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Kayıt ol */}
            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors text-base mt-2"
            >
              {yukleniyor ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              {yukleniyor ? 'Kaydediliyor...' : 'Ücretsiz Kaydol'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Kaydolarak{' '}
              <Link href="#" className="text-primary-600 hover:underline">Kullanım Koşulları</Link>
              {' '}ve{' '}
              <Link href="#" className="text-primary-600 hover:underline">Gizlilik Politikası</Link>
              &apos;nı kabul etmiş olursunuz.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
