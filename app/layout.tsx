import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import KategoriMenu from '@/components/KategoriMenu'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const BASE_URL = process.env.NEXTAUTH_URL || 'https://teknoel.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Teknoel - Teknolojinin Buluşma Noktası',
    template: '%s | Teknoel',
  },
  description:
    "Türkiye'nin teknoloji ürünleri alım satım platformu. Laptop, bilgisayar parçaları, oyun konsolu, cep telefonu ve tablet ilanları.",
  keywords: [
    'ikinci el laptop', 'ekran kartı', 'bilgisayar parçaları', 'oyun konsolu',
    'cep telefonu', 'tablet', 'teknoloji', 'alım satım', 'ikinci el',
    'ikinci el telefon', 'sıfır laptop', 'teknoel',
  ],
  authors: [{ name: 'Teknoel' }],
  creator: 'Teknoel',
  publisher: 'Teknoel',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    siteName: 'Teknoel',
    locale: 'tr_TR',
    type: 'website',
    url: BASE_URL,
    title: 'Teknoel - Teknolojinin Buluşma Noktası',
    description: "Türkiye'nin teknoloji ürünleri alım satım platformu.",
  },
  twitter: {
    card: 'summary_large_image',
    site: '@teknoel',
    title: 'Teknoel - Teknolojinin Buluşma Noktası',
    description: "Türkiye'nin teknoloji ürünleri alım satım platformu.",
  },
  verification: {
    // google: 'BURAYA_GOOGLE_SEARCH_CONSOLE_KODU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="bg-slate-50 min-h-screen flex flex-col">
        <Providers>
          <Header />
          <KategoriMenu />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
