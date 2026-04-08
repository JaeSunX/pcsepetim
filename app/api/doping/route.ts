import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Doping uygula
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const kullanici = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!kullanici) {
      return NextResponse.json({ hata: 'Kullanıcı bulunamadı.' }, { status: 404 })
    }

    const { ilanId, paketId } = await request.json()

    if (!ilanId || !paketId) {
      return NextResponse.json({ hata: 'İlan ve paket seçimi gerekli.' }, { status: 400 })
    }

    const ilan = await prisma.ilan.findUnique({ where: { id: ilanId } })
    if (!ilan || ilan.kullaniciId !== kullanici.id) {
      return NextResponse.json({ hata: 'İlan bulunamadı veya yetkisiz.' }, { status: 403 })
    }

    const paket = await prisma.dopingPaket.findUnique({ where: { id: paketId } })
    if (!paket) {
      return NextResponse.json({ hata: 'Paket bulunamadı.' }, { status: 404 })
    }

    // Dopingin bitiş tarihini hesapla
    const bitisTarihi = new Date()
    bitisTarihi.setDate(bitisTarihi.getDate() + paket.gun)

    // İlanı güncelle
    await prisma.ilan.update({
      where: { id: ilanId },
      data: {
        vitrin: paket.vitrin || ilan.vitrin,
        anasayfaPin: paket.anasayfa || ilan.anasayfaPin,
        renkliYazi: paket.renkliYazi || ilan.renkliYazi,
        kalinYazi: paket.kalinYazi || ilan.kalinYazi,
        dopingBitis: bitisTarihi,
      },
    })

    // Ödeme kaydı oluştur
    await prisma.odeme.create({
      data: {
        ilanId,
        kullaniciId: kullanici.id,
        paketId,
        tutar: paket.fiyat,
        durum: 'TAMAMLANDI',
      },
    })

    return NextResponse.json({
      mesaj: `${paket.ad} dopingi başarıyla uygulandı! ${paket.gun} gün boyunca aktif.`,
      bitisTarihi,
    })
  } catch (error) {
    console.error('Doping hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

// Doping paketlerini getir
export async function GET() {
  try {
    const paketler = await prisma.dopingPaket.findMany({
      orderBy: { fiyat: 'asc' },
    })
    return NextResponse.json({ paketler })
  } catch (error) {
    console.error('Paket listesi hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}
