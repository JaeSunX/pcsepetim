'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react'

const girisSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  sifre: z.string().min(1, 'Şifre gereklidir.'),
})

type GirisForm = z.infer<typeof girisSchema>

export default function GirisPage() {
  const router = useRouter()
  const [sifreGorunur, setSifreGorunur] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GirisForm>({
    resolver: zodResolver(girisSchema),
  })

  const onSubmit = async (data: GirisForm) => {
    setYukleniyor(true)
    try {
      const sonuc = await signIn('credentials', {
        email: data.email,
        sifre: data.sifre,
        redirect: false,
      })

      if (sonuc?.error) {
        toast.error('E-posta veya şifre hatalı.')
      } else {
        toast.success('Hoş geldiniz! Giriş başarılı.')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <span>
              <span className="text-primary-600 font-black text-3xl">Tekno</span>
              <span className="text-gray-800 font-black text-3xl">el</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Hesabınıza Giriş Yapın</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="text-primary-600 font-semibold hover:underline">
              Ücretsiz kaydolun
            </Link>
          </p>
        </div>

        {/* Form kartı */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* E-posta */}
            <div>
              <label className="label">E-posta Adresi</label>
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
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="label">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('sifre')}
                  type={sifreGorunur ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setSifreGorunur(!sifreGorunur)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {sifreGorunur ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.sifre && (
                <p className="text-red-500 text-xs mt-1.5">{errors.sifre.message}</p>
              )}
            </div>

            {/* Giriş yap */}
            <button
              type="submit"
              disabled={yukleniyor}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
            >
              {yukleniyor ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Demo hesaplar */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo Hesaplar</p>
            <div className="space-y-2">
              {[
                { email: 'demo@teknoel.com', ad: 'Demo Kullanıcı' },
                { email: 'ahmet@teknoel.com', ad: 'Ahmet Yılmaz' },
              ].map((hesap) => (
                <button
                  key={hesap.email}
                  type="button"
                  onClick={async () => {
                    setYukleniyor(true)
                    const sonuc = await signIn('credentials', {
                      email: hesap.email,
                      sifre: 'sifre123',
                      redirect: false,
                    })
                    if (!sonuc?.error) {
                      toast.success(`${hesap.ad} olarak giriş yapıldı!`)
                      router.push('/')
                      router.refresh()
                    }
                    setYukleniyor(false)
                  }}
                  className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl px-4 py-2.5 transition-colors group"
                >
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">
                    {hesap.ad}
                  </p>
                  <p className="text-xs text-gray-400">{hesap.email} · sifre123</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
