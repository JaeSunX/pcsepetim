import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import bcrypt from 'bcrypt'

// Kullanıcı profilini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kullaniciId = searchParams.get('id')

    if (kullaniciId) {
      // Belirli kullanıcının profilini getir (halka açık)
      const kullanici = await prisma.User.findUnique({
        where: { id: kullaniciId },
        select: {
          id: true,
          ad: true,
          sehir: true,
          biyografi: true,
          olusturma: true,
          _count: { select: { ilanlar: true } },
          ilanlar: {
            where: { durum: 'AKTIF' },
            orderBy: { olusturma: 'desc' },
            take: 20,
          },
        },
      })

      if (!kullanici) {
        return NextResponse.json({ hata: 'Kullanıcı bulunamadı.' }, { status: 404 })
      }

      return NextResponse.json({ kullanici })
    }

    // Kendi profilini getir (giriş gerekli)
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const kullanici = await prisma.User.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        ad: true,
        telefon: true,
        sehir: true,
        biyografi: true,
        olusturma: true,
        ilanlar: {
          orderBy: { olusturma: 'desc' },
          include: {
            kullanici: { select: { id: true, ad: true, sehir: true } },
          },
        },
      },
    })

    return NextResponse.json({ kullanici })
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

// Kullanıcı kaydı
export async function POST(request: NextRequest) {
  try {
    // Rate limit: IP başına 15 dakikada 5 kayıt denemesi
    const ip = getClientIp(request)
    const { allowed } = rateLimit(`register:${ip}`, 5, 15 * 60_000)
    if (!allowed) {
      return NextResponse.json(
        { hata: 'Çok fazla kayıt denemesi. Lütfen 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    const { ad, email, sifre, telefon, sehir } = await request.json()

    if (!ad || !email || !sifre) {
      return NextResponse.json({ hata: 'Ad, e-posta ve şifre zorunludur.' }, { status: 400 })
    }

    if (sifre.length < 6) {
      return NextResponse.json({ hata: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 })
    }

    const mevcutKullanici = await prisma.User.findUnique({
      where: { email },
    })

    if (mevcutKullanici) {
      return NextResponse.json(
        { hata: 'Bu e-posta adresi zaten kayıtlı.' },
        { status: 409 }
      )
    }

    const hashliSifre = await bcrypt.hash(sifre, 10)

    const kullanici = await prisma.User.create({
      data: {
        ad: ad.trim(),
        email: email.trim().toLowerCase(),
        sifre: hashliSifre,
        telefon: telefon?.trim() || null,
        sehir: sehir || null,
      },
    })

    return NextResponse.json(
      {
        mesaj: 'Hesabınız başarıyla oluşturuldu!',
        kullanici: { id: kullanici.id, email: kullanici.email, ad: kullanici.ad },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

// Profil güncelle
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const body = await request.json()
    const { ad, telefon, sehir, biyografi, yeniSifre, mevcutSifre } = body

    const kullanici = await prisma.User.findUnique({
      where: { email: session.user.email },
    })

    if (!kullanici) {
      return NextResponse.json({ hata: 'Kullanıcı bulunamadı.' }, { status: 404 })
    }

    const updateData: Record<string, string | null> = {}
    if (ad) updateData.ad = ad.trim()
    if (telefon !== undefined) updateData.telefon = telefon?.trim() || null
    if (sehir !== undefined) updateData.sehir = sehir || null
    if (biyografi !== undefined) updateData.biyografi = biyografi?.trim() || null

    if (yeniSifre && mevcutSifre) {
      const sifreDogrumu = await bcrypt.compare(mevcutSifre, kullanici.sifre)
      if (!sifreDogrumu) {
        return NextResponse.json({ hata: 'Mevcut şifre hatalı.' }, { status: 400 })
      }
      updateData.sifre = await bcrypt.hash(yeniSifre, 10)
    }

    await prisma.User.update({
      where: { id: kullanici.id },
      data: updateData,
    })

    return NextResponse.json({ mesaj: 'Profil güncellendi.' })
  } catch (error) {
    console.error('Profil güncelleme hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}
