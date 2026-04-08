'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Search,
  Menu,
  X,
  Plus,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Heart,
  Zap,
} from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [aramaMetni, setAramaMetni] = useState('')
  const [menuAcik, setMenuAcik] = useState(false)
  const [profilMenuAcik, setProfilMenuAcik] = useState(false)

  const handleArama = (e: React.FormEvent) => {
    e.preventDefault()
    if (aramaMetni.trim()) {
      router.push(`/ara?q=${encodeURIComponent(aramaMetni.trim())}`)
    }
  }

  return (
    <header className="bg-primary-600 shadow-lg sticky top-0 z-50">
      {/* Üst bar */}
      <div className="bg-primary-700 py-1 px-4 text-center text-xs text-blue-100 hidden md:block">
        🚀 Teknoel&apos;e hoş geldiniz! Teknolojinin buluşma noktasında alın, satın, kazanın.
      </div>

      {/* Ana header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-xl p-1.5 shadow">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <span className="text-white font-black text-2xl tracking-tight">Tekno</span>
              <span className="text-yellow-300 font-black text-2xl tracking-tight">el</span>
            </div>
          </Link>

          {/* Arama Kutusu */}
          <form onSubmit={handleArama} className="flex-1 hidden md:flex max-w-2xl">
            <div className="flex w-full">
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                placeholder="Laptop, telefon, ekran kartı ara..."
                className="flex-1 px-4 py-2.5 rounded-l-xl text-gray-800 focus:outline-none text-sm border-2 border-transparent focus:border-blue-300"
              />
              <button
                type="submit"
                className="bg-primary-800 hover:bg-primary-900 text-white px-5 py-2.5 rounded-r-xl transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <Search size={16} />
                Ara
              </button>
            </div>
          </form>

          {/* Sağ menü */}
          <div className="flex items-center gap-2 ml-auto">
            {session ? (
              <>
                {/* İlan Ver butonu */}
                <Link
                  href="/ilan/yeni"
                  className="hidden md:flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow"
                >
                  <Plus size={16} />
                  İlan Ver
                </Link>

                {/* Doping butonu */}
                <Link
                  href="/doping"
                  className="hidden md:flex items-center gap-1.5 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-xl font-bold text-xs hover:bg-yellow-300 transition-all"
                >
                  <Zap size={14} />
                  Doping Al
                </Link>

                {/* Profil menüsü */}
                <div className="relative">
                  <button
                    onClick={() => setProfilMenuAcik(!profilMenuAcik)}
                    className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                      {session.user?.name}
                    </span>
                    <ChevronDown size={14} className="hidden md:block" />
                  </button>

                  {profilMenuAcik && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800 text-sm">{session.user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/profil"
                        onClick={() => setProfilMenuAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 text-sm transition-colors"
                      >
                        <User size={16} className="text-gray-400" />
                        Profilim
                      </Link>
                      <Link
                        href="/profil?tab=ilanlar"
                        onClick={() => setProfilMenuAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 text-sm transition-colors"
                      >
                        <Bell size={16} className="text-gray-400" />
                        İlanlarım
                      </Link>
                      <Link
                        href="/ilan/yeni"
                        onClick={() => setProfilMenuAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 text-sm transition-colors"
                      >
                        <Plus size={16} className="text-gray-400" />
                        Yeni İlan Ver
                      </Link>
                      <Link
                        href="/doping"
                        onClick={() => setProfilMenuAcik(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 text-sm transition-colors"
                      >
                        <Zap size={16} className="text-yellow-500" />
                        Doping Al
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setProfilMenuAcik(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm w-full transition-colors"
                        >
                          <LogOut size={16} />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/giris"
                  className="text-white hover:bg-primary-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="bg-white text-primary-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow"
                >
                  Üye Ol
                </Link>
              </div>
            )}

            {/* Mobil menü butonu */}
            <button
              onClick={() => setMenuAcik(!menuAcik)}
              className="md:hidden text-white p-2"
            >
              {menuAcik ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobil arama */}
        <form onSubmit={handleArama} className="flex md:hidden mt-3">
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Ürün ara..."
            className="flex-1 px-4 py-2.5 rounded-l-xl text-gray-800 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-primary-800 text-white px-4 py-2.5 rounded-r-xl"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Mobil menü */}
      {menuAcik && (
        <div className="md:hidden bg-primary-700 border-t border-primary-500 py-4 px-4 space-y-3">
          {session ? (
            <>
              <Link
                href="/ilan/yeni"
                onClick={() => setMenuAcik(false)}
                className="flex items-center gap-2 bg-white text-primary-600 px-4 py-3 rounded-xl font-bold"
              >
                <Plus size={18} />
                İlan Ver
              </Link>
              <Link
                href="/profil"
                onClick={() => setMenuAcik(false)}
                className="flex items-center gap-2 text-white py-2"
              >
                <User size={18} />
                Profilim
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-red-300 py-2"
              >
                <LogOut size={18} />
                Çıkış Yap
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/giris"
                onClick={() => setMenuAcik(false)}
                className="flex-1 text-center text-white border border-white/30 py-3 rounded-xl font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                onClick={() => setMenuAcik(false)}
                className="flex-1 text-center bg-white text-primary-600 py-3 rounded-xl font-bold"
              >
                Üye Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
