import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ilan = await prisma.ilan.findUnique({
      where: { id: params.id },
      include: {
        kullanici: {
          select: {
            id: true,
            ad: true,
            telefon: true,
            sehir: true,
            biyografi: true,
            olusturma: true,
            _count: { select: { ilanlar: true } },
          },
        },
      },
    })

    if (!ilan) {
      return NextResponse.json({ hata: 'İlan bulunamadı.' }, { status: 404 })
    }

    // Görüntülenmeyi artır
    await prisma.ilan.update({
      where: { id: params.id },
      data: { goruntuleme: { increment: 1 } },
    })

    return NextResponse.json({ ilan })
  } catch (error) {
    console.error('İlan detay hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email },
    })

    const ilan = await prisma.ilan.findUnique({ where: { id: params.id } })

    if (!ilan || !kullanici || ilan.kullaniciId !== kullanici.id) {
      return NextResponse.json({ hata: 'Yetkisiz işlem.' }, { status: 403 })
    }

    const body = await request.json()
    const guncelIlan = await prisma.ilan.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ ilan: guncelIlan })
  } catch (error) {
    console.error('İlan güncelleme hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email },
    })

    const ilan = await prisma.ilan.findUnique({ where: { id: params.id } })

    if (!ilan || !kullanici || ilan.kullaniciId !== kullanici.id) {
      return NextResponse.json({ hata: 'Yetkisiz işlem.' }, { status: 403 })
    }

    await prisma.ilan.delete({ where: { id: params.id } })

    return NextResponse.json({ mesaj: 'İlan silindi.' })
  } catch (error) {
    console.error('İlan silme hatası:', error)
    return NextResponse.json({ hata: 'Sunucu hatası' }, { status: 500 })
  }
}
