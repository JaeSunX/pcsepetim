import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sanitizeText, stripHtml } from '@/lib/utils'

// İlan listesi - filtreleme ve sayfalama desteği
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sayfa = parseInt(searchParams.get('sayfa') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const kategori = searchParams.get('kategori')
    const sehir = searchParams.get('sehir')
    const minFiyat = searchParams.get('minFiyat')
    const maxFiyat = searchParams.get('maxFiyat')
    const arama = searchParams.get('q')
    const siralama = searchParams.get('siralama') || 'yeni'
    const vitrin = searchParams.get('vitrin')
    const anasayfa = searchParams.get('anasayfa')

    const where: Record<string, unknown> = {
      durum: 'AKTIF',
    }

    if (kategori) where.kategori = { contains: kategori }
    if (sehir) where.sehir = sehir
    if (vitrin === '1') {
      where.vitrin = true
      where.dopingBitis = { gt: new Date() }
    }
    if (anasayfa === '1') {
      where.anasayfaPin = true
      where.dopingBitis = { gt: new Date() }
    }
    if (minFiyat || maxFiyat) {
      where.fiyat = {}
      if (minFiyat) (where.fiyat as Record<string, number>).gte = parseFloat(minFiyat)
      if (maxFiyat) (where.fiyat as Record<string, number>).lte = parseFloat(maxFiyat)
    }
    if (arama) {
      where.OR = [
        { baslik: { contains: arama } },
        { aciklama: { contains: arama } },
      ]
    }

    const siralamalar: Record<string, object> = {
      yeni: { olusturma: 'desc' },
      eski: { olusturma: 'asc' },
      ucuz: { fiyat: 'asc' },
      pahali: { fiyat: 'desc' },
      populer: { goruntuleme: 'desc' },
    }

    const [ilanlar, toplam] = await Promise.all([
      prisma.ilan.findMany({
        where,
        include: {
          kullanici: {
            select: { id: true, ad: true, sehir: true },
          },
        },
        orderBy: siralamalar[siralama] || { olusturma: 'desc' },
        skip: (sayfa - 1) * limit,
        take: limit,
      }),
      prisma.ilan.count({ where }),
    ])

    return NextResponse.json({
      ilanlar,
      toplam,
      sayfa,
      toplamSayfa: Math.ceil(toplam / limit),
    })
  } catch (error) {
    console.error('İlan listesi hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

// Yeni ilan oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email },
    })

    if (!kullanici) {
      return NextResponse.json({ hata: 'Kullanıcı bulunamadı.' }, { status: 404 })
    }

    const body = await request.json()
    const { baslik, aciklama, fiyat, kategori, altKategori, resimler, sehir, ilce } = body

    if (!baslik || !aciklama || !fiyat || !kategori || !sehir) {
      return NextResponse.json({ hata: 'Zorunlu alanlar eksik.' }, { status: 400 })
    }

    const ilan = await prisma.ilan.create({
      data: {
        baslik: sanitizeText(baslik),
        aciklama: stripHtml(aciklama),
        fiyat: parseFloat(fiyat),
        kategori,
        altKategori: altKategori || null,
        resimler: JSON.stringify(resimler || []),
        sehir,
        ilce: ilce || null,
        kullaniciId: kullanici.id,
      },
    })

    return NextResponse.json({ ilan }, { status: 201 })
  } catch (error) {
    console.error('İlan oluşturma hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}
