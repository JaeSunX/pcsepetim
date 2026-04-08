import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

// Uygulama tipleri
export type IlanDurum = 'AKTIF' | 'PASIF' | 'SATILDI'

export interface IlanKarti {
  id: string
  baslik: string
  fiyat: number
  kategori: string
  altKategori: string | null
  resimler: string
  durum: string
  sehir: string
  ilce: string | null
  vitrin: boolean
  anasayfaPin: boolean
  renkliYazi: boolean
  kalinYazi: boolean
  dopingBitis: Date | null
  goruntuleme: number
  olusturma: Date
  kullanici: {
    id: string
    ad: string
    sehir: string | null
  }
}

export interface IlanDetay extends IlanKarti {
  aciklama: string
  kullanici: {
    id: string
    ad: string
    telefon: string | null
    sehir: string | null
    biyografi: string | null
    olusturma: Date
    _count?: {
      ilanlar: number
    }
  }
}

export interface DopingPaket {
  id: string
  ad: string
  aciklama: string
  fiyat: number
  gun: number
  vitrin: boolean
  anasayfa: boolean
  renkliYazi: boolean
  kalinYazi: boolean
  populer: boolean
  renk: string
}
