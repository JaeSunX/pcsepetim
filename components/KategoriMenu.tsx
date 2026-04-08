'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { kategoriler } from '@/lib/kategoriler'
import { cn } from '@/lib/utils'

export default function KategoriMenu() {
  const pathname = usePathname()

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {kategoriler.map((kat) => {
            const aktif = pathname === `/kategori/${kat.slug}`
            return (
              <Link
                key={kat.id}
                href={`/kategori/${kat.slug}`}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap font-medium transition-all shrink-0',
                  aktif
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-primary-600'
                )}
              >
                <span className="text-base">{kat.ikon}</span>
                <span className="text-xs md:text-sm">{kat.ad}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
