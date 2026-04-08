import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const IZIN_VERILEN_TIPLER = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_BOYUT = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    // Yetkilendirme zorunlu
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    // Rate limit: kullanıcı başına dakikada 20 dosya
    const ip = getClientIp(request)
    const { allowed } = rateLimit(`upload:${session.user.email}:${ip}`, 20, 60_000)
    if (!allowed) {
      return NextResponse.json({ hata: 'Çok fazla istek. Lütfen bekleyin.' }, { status: 429 })
    }

    const formData = await request.formData()
    const dosya = formData.get('dosya') as File

    if (!dosya) {
      return NextResponse.json({ hata: 'Dosya bulunamadı.' }, { status: 400 })
    }

    if (!IZIN_VERILEN_TIPLER.includes(dosya.type)) {
      return NextResponse.json(
        { hata: 'Sadece JPEG, PNG ve WebP formatları kabul edilir.' },
        { status: 400 }
      )
    }

    if (dosya.size > MAX_BOYUT) {
      return NextResponse.json(
        { hata: 'Dosya boyutu 10MB\'dan büyük olamaz.' },
        { status: 400 }
      )
    }

    const bytes = await dosya.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uzanti = dosya.name.split('.').pop() || 'jpg'
    const dosyaAdi = `${uuidv4()}.${uzanti}`
    const klasorYolu = path.join(process.cwd(), 'public', 'uploads')

    // Klasörü oluştur
    if (!existsSync(klasorYolu)) {
      await mkdir(klasorYolu, { recursive: true })
    }

    const dosyaYolu = path.join(klasorYolu, dosyaAdi)
    await writeFile(dosyaYolu, buffer)

    return NextResponse.json({ url: `/uploads/${dosyaAdi}` })
  } catch (error) {
    console.error('Yükleme hatası:', error)
    return NextResponse.json({ hata: 'Yükleme sırasında hata oluştu.' }, { status: 500 })
  }
}
