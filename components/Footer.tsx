import Link from 'next/link'
import { kategoriler } from '@/lib/kategoriler'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Ana footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Hakkında */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span>
                <span className="text-white font-black text-xl">Tekno</span>
                <span className="text-yellow-400 font-black text-xl">el</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Türkiye&apos;nin teknoloji ürünleri alım satım platformu. Güvenli, hızlı ve kolay.
            </p>
            <p className="text-xs text-gray-500">
              📍 İstanbul, Türkiye
              <br />
              📧 destek@teknoel.com
              <br />
              📞 0850 123 45 67
            </p>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="text-white font-bold mb-4">Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              {kategoriler.slice(0, 6).map((kat) => (
                <li key={kat.id}>
                  <Link
                    href={`/kategori/${kat.slug}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {kat.ikon} {kat.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-white font-bold mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ilan/yeni" className="text-gray-400 hover:text-blue-400 transition-colors">
                  ➕ İlan Ver
                </Link>
              </li>
              <li>
                <Link href="/doping" className="text-gray-400 hover:text-blue-400 transition-colors">
                  ⚡ Doping Al
                </Link>
              </li>
              <li>
                <Link href="/kayit" className="text-gray-400 hover:text-blue-400 transition-colors">
                  👤 Üye Ol
                </Link>
              </li>
              <li>
                <Link href="/giris" className="text-gray-400 hover:text-blue-400 transition-colors">
                  🔑 Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/ara" className="text-gray-400 hover:text-blue-400 transition-colors">
                  🔍 Arama Yap
                </Link>
              </li>
            </ul>
          </div>

          {/* Doping Paketleri */}
          <div>
            <h3 className="text-white font-bold mb-4">Doping Paketleri</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">🟠 Öne Çıkar - 39,99₺</li>
              <li className="text-gray-400">⭐ Vitrin - 79,99₺</li>
              <li className="text-gray-400">🏠 Anasayfa - 129,99₺</li>
              <li className="text-gray-400">🚀 Süper Doping - 199,99₺</li>
            </ul>
            <Link
              href="/doping"
              className="inline-block mt-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition-colors"
            >
              Tüm Paketler →
            </Link>
          </div>
        </div>
      </div>

      {/* Alt bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Teknoel. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-gray-300 transition-colors">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Kullanım Koşulları</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Çerez Politikası</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Yardım</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
