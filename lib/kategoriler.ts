export type Kategori = {
  id: string
  ad: string
  ikon: string
  slug: string
  altKategoriler: AltKategori[]
}

export type AltKategori = {
  id: string
  ad: string
  slug: string
}

export const kategoriler: Kategori[] = [
  {
    id: 'laptop',
    ad: 'Laptop & Notebook',
    ikon: '💻',
    slug: 'laptop-notebook',
    altKategoriler: [
      { id: 'gaming-laptop', ad: 'Gaming Laptop', slug: 'gaming-laptop' },
      { id: 'is-laptopu', ad: 'İş Laptopu', slug: 'is-laptopu' },
      { id: 'ultrabook', ad: 'Ultrabook', slug: 'ultrabook' },
      { id: 'laptop-parcasi', ad: 'Laptop Parçaları', slug: 'laptop-parcasi' },
    ],
  },
  {
    id: 'masaustu',
    ad: 'Masaüstü Bilgisayar',
    ikon: '🖥️',
    slug: 'masaustu-bilgisayar',
    altKategoriler: [
      { id: 'hazir-sistem', ad: 'Hazır Sistem', slug: 'hazir-sistem' },
      { id: 'barebone', ad: 'Barebone', slug: 'barebone' },
    ],
  },
  {
    id: 'parca',
    ad: 'Bilgisayar Parçaları',
    ikon: '⚙️',
    slug: 'bilgisayar-parcalari',
    altKategoriler: [
      { id: 'islemci', ad: 'İşlemci (CPU)', slug: 'islemci' },
      { id: 'ekran-karti', ad: 'Ekran Kartı (GPU)', slug: 'ekran-karti' },
      { id: 'ram', ad: 'RAM', slug: 'ram' },
      { id: 'anakart', ad: 'Anakart', slug: 'anakart' },
      { id: 'ssd', ad: 'SSD / HDD', slug: 'ssd-hdd' },
      { id: 'guc-kaynagi', ad: 'Güç Kaynağı', slug: 'guc-kaynagi' },
      { id: 'kasa', ad: 'Kasa', slug: 'kasa' },
      { id: 'sogutma', ad: 'Soğutma', slug: 'sogutma' },
    ],
  },
  {
    id: 'monitor',
    ad: 'Monitör',
    ikon: '🖥',
    slug: 'monitor',
    altKategoriler: [
      { id: 'gaming-monitor', ad: 'Gaming Monitör', slug: 'gaming-monitor' },
      { id: 'ofis-monitor', ad: 'Ofis Monitör', slug: 'ofis-monitor' },
      { id: '4k-monitor', ad: '4K Monitör', slug: '4k-monitor' },
    ],
  },
  {
    id: 'cep-telefonu',
    ad: 'Cep Telefonu',
    ikon: '📱',
    slug: 'cep-telefonu',
    altKategoriler: [
      { id: 'akilli-telefon', ad: 'Akıllı Telefon', slug: 'akilli-telefon' },
      { id: 'telefon-aksesuar', ad: 'Telefon Aksesuar', slug: 'telefon-aksesuar' },
    ],
  },
  {
    id: 'tablet',
    ad: 'Tablet',
    ikon: '📲',
    slug: 'tablet',
    altKategoriler: [
      { id: 'ipad', ad: 'iPad', slug: 'ipad' },
      { id: 'android-tablet', ad: 'Android Tablet', slug: 'android-tablet' },
      { id: 'windows-tablet', ad: 'Windows Tablet', slug: 'windows-tablet' },
    ],
  },
  {
    id: 'konsol',
    ad: 'Oyun Konsolu',
    ikon: '🎮',
    slug: 'oyun-konsolu',
    altKategoriler: [
      { id: 'playstation', ad: 'PlayStation', slug: 'playstation' },
      { id: 'xbox', ad: 'Xbox', slug: 'xbox' },
      { id: 'nintendo', ad: 'Nintendo Switch', slug: 'nintendo-switch' },
      { id: 'oyun-aksesuar', ad: 'Oyun & Aksesuar', slug: 'oyun-aksesuar' },
    ],
  },
  {
    id: 'aksesuar',
    ad: 'Aksesuar',
    ikon: '🖱️',
    slug: 'aksesuar',
    altKategoriler: [
      { id: 'klavye-mouse', ad: 'Klavye & Mouse', slug: 'klavye-mouse' },
      { id: 'kulalik', ad: 'Kulaklık', slug: 'kulalik' },
      { id: 'webcam', ad: 'Webcam', slug: 'webcam' },
      { id: 'gamepad', ad: 'Gamepad & Kol', slug: 'gamepad' },
    ],
  },
  {
    id: 'kamera',
    ad: 'Kamera & Fotoğraf',
    ikon: '📷',
    slug: 'kamera',
    altKategoriler: [
      { id: 'dslr', ad: 'DSLR', slug: 'dslr' },
      { id: 'aynasiz', ad: 'Aynasız', slug: 'aynasiz' },
      { id: 'aksiyon', ad: 'Aksiyon Kamera', slug: 'aksiyon-kamera' },
      { id: 'lens', ad: 'Lens & Aksesuar', slug: 'lens-aksesuar' },
    ],
  },
  {
    id: 'diger',
    ad: 'Diğer Elektronik',
    ikon: '🔌',
    slug: 'diger-elektronik',
    altKategoriler: [
      { id: 'yazici', ad: 'Yazıcı & Tarayıcı', slug: 'yazici-tarayici' },
      { id: 'network', ad: 'Ağ & İnternet', slug: 'ag-internet' },
      { id: 'akilli-saat', ad: 'Akıllı Saat', slug: 'akilli-saat' },
    ],
  },
]

export function kategoriGetir(slug: string): Kategori | undefined {
  return kategoriler.find((k) => k.slug === slug)
}

export function tumKategoriAdlari(): string[] {
  return kategoriler.map((k) => k.ad)
}
