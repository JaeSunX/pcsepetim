import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

function escapeValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
  const raw = String(value)
  const escaped = raw.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `'${escaped}'`
}

async function main() {
  const now = new Date()
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const futureSql = future.toISOString().slice(0, 19).replace('T', ' ')

  const paketler = [
    {
      id: 'paket-one-cikar',
      ad: 'Öne Çıkar',
      aciklama: 'İlanın kategori sayfasında üstte çıksın, renkli ve kalın yazı ile dikkat çeksin.',
      fiyat: 39.99,
      gun: 3,
      vitrin: false,
      anasayfa: false,
      renkliYazi: true,
      kalinYazi: true,
      populer: false,
      renk: 'blue',
    },
    {
      id: 'paket-vitrin',
      ad: 'Vitrin',
      aciklama: 'İlanın vitrin bölümünde gösterilir, altın çerçeve ve özel rozet ile öne çıkar.',
      fiyat: 79.99,
      gun: 7,
      vitrin: true,
      anasayfa: false,
      renkliYazi: true,
      kalinYazi: true,
      populer: true,
      renk: 'amber',
    },
    {
      id: 'paket-anasayfa',
      ad: 'Anasayfa',
      aciklama: 'İlanın ana sayfanın en üstünde sabitlenir, milyonlarca kullanıcıya ulaşır.',
      fiyat: 129.99,
      gun: 7,
      vitrin: false,
      anasayfa: true,
      renkliYazi: true,
      kalinYazi: true,
      populer: false,
      renk: 'purple',
    },
    {
      id: 'paket-super',
      ad: 'Süper Doping',
      aciklama: 'Tüm doping özellikleri bir arada! Vitrin + Anasayfa + Öne Çıkar. Maksimum görünürlük.',
      fiyat: 199.99,
      gun: 15,
      vitrin: true,
      anasayfa: true,
      renkliYazi: true,
      kalinYazi: true,
      populer: false,
      renk: 'pink',
    },
  ]

  const users = [
    {
      id: 'kullanici-demo',
      email: 'demo@teknoel.com',
      sifre: await bcrypt.hash('sifre123', 10),
      ad: 'Demo Kullanıcı',
      telefon: '0532 111 22 33',
      sehir: 'İstanbul',
      biyografi: 'Teknoloji meraklısı, güvenilir satıcı.',
    },
    {
      id: 'kullanici-ahmet',
      email: 'ahmet@teknoel.com',
      sifre: await bcrypt.hash('sifre123', 10),
      ad: 'Ahmet Yılmaz',
      telefon: '0533 222 33 44',
      sehir: 'Ankara',
      biyografi: 'Bilgisayar mühendisi, ikinci el teknoloji satıcısı.',
    },
    {
      id: 'kullanici-mehmet',
      email: 'mehmet@teknoel.com',
      sifre: await bcrypt.hash('sifre123', 10),
      ad: 'Mehmet Kaya',
      telefon: '0535 333 44 55',
      sehir: 'İzmir',
      biyografi: 'Oyun dünyasının satıcısı, konsol uzmanı.',
    },
  ]

  const ilanlar = [
    {
      id: 'ilan-1',
      baslik: 'ASUS ROG Strix RTX 4090 OC 24GB - Garantili',
      aciklama: 'Asus ROG Strix RTX 4090 OC 24GB GDDR6X. Faturalı, garantili, kutusu tam. 8 ay kullanıldı. Performans düşüşü yok, temizlendi. Kargo ile gönderilebilir. Elden teslim İstanbul Kadıköy.',
      fiyat: 38500,
      kategori: 'Bilgisayar Parçaları',
      altKategori: 'Ekran Kartı (GPU)',
      resimler: JSON.stringify(['https://picsum.photos/seed/rtx4090/800/600', 'https://picsum.photos/seed/rtx4090b/800/600']),
      sehir: 'İstanbul',
      ilce: 'Kadıköy',
      vitrin: true,
      anasayfaPin: true,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 1247,
      kullaniciId: 'kullanici-demo',
    },
    {
      id: 'ilan-2',
      baslik: 'iPhone 15 Pro Max 256GB Doğal Titanyum - Sıfır Ayarında',
      aciklama: 'iPhone 15 Pro Max 256GB, Doğal Titanyum renk. Kutusunda faturası mevcut. Hiçbir çizik yok, kılıf ile kullanıldı. Apple Türkiye garantisi devam ediyor. Değişim düşünmüyorum.',
      fiyat: 44900,
      kategori: 'Cep Telefonu',
      altKategori: 'Akıllı Telefon',
      resimler: JSON.stringify(['https://picsum.photos/seed/iphone15/800/600', 'https://picsum.photos/seed/iphone15b/800/600']),
      sehir: 'İstanbul',
      ilce: 'Beşiktaş',
      vitrin: true,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 2891,
      kullaniciId: 'kullanici-ahmet',
    },
    {
      id: 'ilan-3',
      baslik: 'MacBook Pro M3 Max 16" 36GB RAM 1TB - AppleCare+',
      aciklama: 'MacBook Pro M3 Max işlemci, 36GB Birleşik Bellek, 1TB SSD. Space Black renk. AppleCare+ ile 2 yıl garantisi var. Grafik tasarım için kullanıldı, performans mükemmel. Kutusu ve aksesuarları tam.',
      fiyat: 89000,
      kategori: 'Laptop & Notebook',
      altKategori: 'İş Laptopu',
      resimler: JSON.stringify(['https://picsum.photos/seed/macbookm3/800/600', 'https://picsum.photos/seed/macbookm3b/800/600']),
      sehir: 'İzmir',
      ilce: 'Bornova',
      vitrin: true,
      anasayfaPin: true,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 3456,
      kullaniciId: 'kullanici-mehmet',
    },
    {
      id: 'ilan-4',
      baslik: 'PlayStation 5 Slim + 2 DualSense + FIFA 25 + God of War',
      aciklama: 'PS5 Slim Disc Edition, 1TB. Kutusunda garantisi devam ediyor. 2 adet DualSense kol (biri hiç kullanılmadı), FIFA 25 ve God of War Ragnarök oyunları dahil. Çok temiz durumda.',
      fiyat: 19500,
      kategori: 'Oyun Konsolu',
      altKategori: 'PlayStation',
      resimler: JSON.stringify(['https://picsum.photos/seed/ps5slim/800/600', 'https://picsum.photos/seed/ps5slimb/800/600']),
      sehir: 'Ankara',
      ilce: 'Çankaya',
      vitrin: true,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 1876,
      kullaniciId: 'kullanici-ahmet',
    },
    {
      id: 'ilan-5',
      baslik: 'AMD Ryzen 9 7950X - Kutusunda Faturalı',
      aciklama: 'AMD Ryzen 9 7950X işlemci, 16 çekirdek 32 thread. Kutusunda, faturası mevcut, garantisi devam ediyor. Hiç kullanılmadı, açılmadı bile. Acil satışa çıkardım.',
      fiyat: 13500,
      kategori: 'Bilgisayar Parçaları',
      altKategori: 'İşlemci (CPU)',
      resimler: JSON.stringify(['https://picsum.photos/seed/ryzen9/800/600']),
      sehir: 'İstanbul',
      ilce: 'Ümraniye',
      vitrin: true,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 934,
      kullaniciId: 'kullanici-demo',
    },
    {
      id: 'ilan-6',
      baslik: 'Samsung Galaxy S24 Ultra 512GB Titanyum Siyah',
      aciklama: 'Samsung Galaxy S24 Ultra, 512GB dahili hafıza, 12GB RAM. Titanyum Siyah renk. Samsung Türkiye garantisi var, faturalı. S-Pen dahil. Telefonu değiştirdiğim için satıyorum.',
      fiyat: 39900,
      kategori: 'Cep Telefonu',
      altKategori: 'Akıllı Telefon',
      resimler: JSON.stringify(['https://picsum.photos/seed/s24ultra/800/600', 'https://picsum.photos/seed/s24ultrab/800/600']),
      sehir: 'İzmir',
      ilce: 'Karşıyaka',
      vitrin: true,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 2103,
      kullaniciId: 'kullanici-mehmet',
    },
    {
      id: 'ilan-7',
      baslik: 'ASUS ROG Swift PG32UQX 4K 144Hz 32" IPS Gaming Monitör',
      aciklama: 'ASUS ROG Swift PG32UQX, 4K UHD 3840x2160, 144Hz, IPS panel, G-Sync Ultimate. 14 ay önce alındı, kutusu ve aksesuarları mevcut. Gaming kurulumunu dağıttığım için satıyorum.',
      fiyat: 24000,
      kategori: 'Monitör',
      altKategori: 'Gaming Monitör',
      resimler: JSON.stringify(['https://picsum.photos/seed/rogmonitor/800/600']),
      sehir: 'Ankara',
      ilce: 'Keçiören',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 567,
      kullaniciId: 'kullanici-ahmet',
    },
    {
      id: 'ilan-8',
      baslik: 'Nintendo Switch OLED + 15 Oyun + Taşıma Çantası',
      aciklama: 'Nintendo Switch OLED Model, beyaz renk. 15 adet dijital oyun yüklü (Mario, Zelda, Pokemon dahil). Özel taşıma çantası ve ekstra kılıf mevcut. 1 yıl kullanıldı, ekranda sıfır çizik.',
      fiyat: 10500,
      kategori: 'Oyun Konsolu',
      altKategori: 'Nintendo Switch',
      resimler: JSON.stringify(['https://picsum.photos/seed/switcholed/800/600']),
      sehir: 'Bursa',
      ilce: 'Osmangazi',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: true,
      kalinYazi: true,
      dopingBitis: futureSql,
      goruntuleme: 789,
      kullaniciId: 'kullanici-demo',
    },
    {
      id: 'ilan-9',
      baslik: 'Corsair Vengeance 64GB DDR5 6000MHz RGB RAM',
      aciklama: 'Corsair Vengeance DDR5, 2x32GB kit, 6000MHz CL36. RGB aydınlatma. Intel XMP 3.0 destekli. Yaklaşık 6 ay kullanıldı, hiçbir sorun yok. Sistem değişikliği nedeniyle satışa çıkarıldı.',
      fiyat: 4800,
      kategori: 'Bilgisayar Parçaları',
      altKategori: 'RAM',
      resimler: JSON.stringify(['https://picsum.photos/seed/corsairram/800/600']),
      sehir: 'İstanbul',
      ilce: 'Maltepe',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 234,
      kullaniciId: 'kullanici-demo',
    },
    {
      id: 'ilan-10',
      baslik: 'iPad Pro M4 11" 256GB WiFi + Cellular Uzay Siyahı',
      aciklama: 'iPad Pro M4 11 inç, 256GB, WiFi+Cellular. Uzay Siyahı renk. Apple Pencil Pro ile birlikte (ayrıca satılır). 3 ay kullanıldı, kaportası sıfır. Okul için alınmıştı, kullanmıyorum.',
      fiyat: 34500,
      kategori: 'Tablet',
      altKategori: 'iPad',
      resimler: JSON.stringify(['https://picsum.photos/seed/ipadprom4/800/600', 'https://picsum.photos/seed/ipadprom4b/800/600']),
      sehir: 'İzmir',
      ilce: 'Konak',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 456,
      kullaniciId: 'kullanici-mehmet',
    },
    {
      id: 'ilan-11',
      baslik: 'Logitech G Pro X Superlight 2 Gaming Mouse',
      aciklama: 'Logitech G Pro X Superlight 2, siyah renk. HERO 2 sensor, 32000 DPI. Yeni fiyatın çok altında. 2 ay kullanıldı, kutusu var. Oyun bırakma nedeniyle satıyorum.',
      fiyat: 2200,
      kategori: 'Aksesuar',
      altKategori: 'Klavye & Mouse',
      resimler: JSON.stringify(['https://picsum.photos/seed/logitechg/800/600']),
      sehir: 'Ankara',
      ilce: 'Yenimahalle',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 189,
      kullaniciId: 'kullanici-ahmet',
    },
    {
      id: 'ilan-12',
      baslik: 'MSI MAG B650 TOMAHAWK WIFI Anakart AM5',
      aciklama: 'MSI MAG B650 TOMAHAWK WIFI anakart, AM5 soket. DDR5 destekli, PCIe 5.0 M.2. WiFi 6E dahili. 4 ay kullanıldı, sorunsuz çalışıyor. Kutusu ve aksesuarları mevcut.',
      fiyat: 5200,
      kategori: 'Bilgisayar Parçaları',
      altKategori: 'Anakart',
      resimler: JSON.stringify(['https://picsum.photos/seed/msianakart/800/600']),
      sehir: 'İstanbul',
      ilce: 'Bağcılar',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 312,
      kullaniciId: 'kullanici-demo',
    },
    {
      id: 'ilan-13',
      baslik: 'Sony WH-1000XM5 Kablosuz Gürültü Önleyici Kulaklık',
      aciklama: 'Sony WH-1000XM5, siyah renk. Sektörün en iyi ANC teknolojisi. 30 saat pil ömrü. 5 ay kullanıldı, orijinal kılıfı ve aksesuarları mevcut. Temiz, bakımlı.',
      fiyat: 6800,
      kategori: 'Aksesuar',
      altKategori: 'Kulaklık',
      resimler: JSON.stringify(['https://picsum.photos/seed/sonywh/800/600']),
      sehir: 'İzmir',
      ilce: 'Bayraklı',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 267,
      kullaniciId: 'kullanici-mehmet',
    },
    {
      id: 'ilan-14',
      baslik: 'Xbox Series X 1TB + Game Pass Ultimate 6 Aylık',
      aciklama: 'Xbox Series X, 1TB SSD. 6 aylık Game Pass Ultimate kodu dahil. Orijinal kutusunda, garantisi var. 8 ay kullanıldı, hiçbir sorun yaşamadım. PS5\'e geçiş nedeniyle satıyorum.',
      fiyat: 15000,
      kategori: 'Oyun Konsolu',
      altKategori: 'Xbox',
      resimler: JSON.stringify(['https://picsum.photos/seed/xboxsx/800/600']),
      sehir: 'Bursa',
      ilce: 'Nilüfer',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 543,
      kullaniciId: 'kullanici-ahmet',
    },
    {
      id: 'ilan-15',
      baslik: 'Lenovo ThinkPad X1 Carbon Gen 12 i7-1365U 32GB 1TB',
      aciklama: 'Lenovo ThinkPad X1 Carbon 12. Nesil, Intel Core Ultra 7 165U, 32GB LPDDR5, 1TB NVMe SSD. 14" 2.8K OLED ekran. İş seyahati için alındı, nadiren kullanıldı. Faturalı garantili.',
      fiyat: 52000,
      kategori: 'Laptop & Notebook',
      altKategori: 'İş Laptopu',
      resimler: JSON.stringify(['https://picsum.photos/seed/thinkpadx1/800/600']),
      sehir: 'Ankara',
      ilce: 'Çankaya',
      vitrin: false,
      anasayfaPin: false,
      renkliYazi: false,
      kalinYazi: false,
      dopingBitis: null,
      goruntuleme: 678,
      kullaniciId: 'kullanici-ahmet',
    },
  ]

  const schemaPath = path.join(process.cwd(), 'prisma', 'initial_schema.sql')
  const schema = fs.existsSync(schemaPath)
    ? fs.readFileSync(schemaPath, { encoding: 'utf8' })
    : `-- Schema not found: prisma/initial_schema.sql`

  const lines: string[] = []
  lines.push('-- Full SQL export including seed data')
  lines.push(`-- Generated: ${new Date().toISOString()}`)
  lines.push('SET FOREIGN_KEY_CHECKS=0;')
  lines.push('')
  lines.push(schema)
  lines.push('')
  lines.push('-- -----------------------------------------------------')
  lines.push('-- Seed data for table `doping_paketler`')
  lines.push('-- -----------------------------------------------------')
  lines.push(
    'INSERT INTO `doping_paketler` (`id`, `ad`, `aciklama`, `fiyat`, `gun`, `vitrin`, `anasayfa`, `renkliYazi`, `kalinYazi`, `populer`, `renk`) VALUES',
  )
  lines.push(
    paketler
      .map(
        (row) =>
          `(${[row.id, row.ad, row.aciklama, row.fiyat, row.gun, row.vitrin, row.anasayfa, row.renkliYazi, row.kalinYazi, row.populer, row.renk]
            .map(escapeValue)
            .join(', ')})`,
      )
      .join(',\n'),
  )
  lines.push(';')
  lines.push('')
  lines.push('-- -----------------------------------------------------')
  lines.push('-- Seed data for table `Users`')
  lines.push('-- -----------------------------------------------------')
  lines.push(
    'INSERT INTO `Users` (`id`, `email`, `sifre`, `ad`, `telefon`, `sehir`, `biyografi`) VALUES',
  )
  lines.push(
    users
      .map(
        (row) =>
          `(${[row.id, row.email, row.sifre, row.ad, row.telefon, row.sehir, row.biyografi].map(escapeValue).join(', ')})`,
      )
      .join(',\n'),
  )
  lines.push(';')
  lines.push('')
  lines.push('-- -----------------------------------------------------')
  lines.push('-- Seed data for table `ilanlar`')
  lines.push('-- -----------------------------------------------------')
  lines.push(
    'INSERT INTO `ilanlar` (`id`, `baslik`, `aciklama`, `fiyat`, `kategori`, `altKategori`, `resimler`, `durum`, `sehir`, `ilce`, `vitrin`, `anasayfaPin`, `renkliYazi`, `kalinYazi`, `dopingBitis`, `kullaniciId`, `goruntuleme`) VALUES',
  )
  lines.push(
    ilanlar
      .map((row) =>
        `(${[
          row.id,
          row.baslik,
          row.aciklama,
          row.fiyat,
          row.kategori,
          row.altKategori,
          row.resimler,
          'AKTIF',
          row.sehir,
          row.ilce,
          row.vitrin,
          row.anasayfaPin,
          row.renkliYazi,
          row.kalinYazi,
          row.dopingBitis,
          row.kullaniciId,
          row.goruntuleme,
        ]
          .map(escapeValue)
          .join(', ')})`,
      )
      .join(',\n'),
  )
  lines.push(';')
  lines.push('')
  lines.push('SET FOREIGN_KEY_CHECKS=1;')

  const outputPath = path.join(process.cwd(), 'prisma', 'full_export.sql')
  fs.writeFileSync(outputPath, lines.join('\n'), { encoding: 'utf8' })
  console.log(`Wrote SQL export to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
