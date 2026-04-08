import { prisma } from '../lib/prisma'

function extractProductSeed(title: string): string {
  const lowerTitle = title.toLowerCase()

  // Marka ve modeller için pattern'ler
  const patterns = [
    // Ekran kartları
    /(rtx\s*\d{4})/i,
    /(gtx\s*\d{4})/i,
    /(rx\s*\d{4})/i,
    /(rtx\s*\d{3})/i,

    // Telefonlar
    /(iphone\s*\d+)/i,
    /(galaxy\s*[sz]\d+)/i,
    /(pixel\s*\d+)/i,

    // Bilgisayarlar
    /(macbook\s*(pro|air)?\s*(m\d+)?)/i,
    /(thinkpad)/i,
    /(dell\s*xps)/i,
    /(hp\s*spectre)/i,

    // Oyun konsolları
    /(playstation\s*\d+)/i,
    /(xbox\s*series\s*[xs])/i,
    /(nintendo\s*switch)/i,

    // Tabletler
    /(ipad\s*(pro|air)?)/i,
    /(galaxy\s*tab)/i,

    // Kulaklıklar
    /(airpods)/i,
    /(sony\s*wh-\d+)/i,

    // Mouse/Keyboard
    /(logitech\s*g\s*pro)/i,
    /(razer)/i,

    // Genel markalar
    /(asus\s*rog)/i,
    /(msi)/i,
    /(corsair)/i,
    /(samsung)/i,
    /(apple)/i,
    /(sony)/i,
    /(nintendo)/i,
    /(microsoft)/i,
  ]

  for (const pattern of patterns) {
    const match = lowerTitle.match(pattern)
    if (match) {
      return match[1].replace(/\s+/g, '').toLowerCase()
    }
  }

  // Pattern bulunamazsa, başlıktaki ilk birkaç kelimeyi al
  const words = lowerTitle.split(/\s+/)
  const productWords = words.filter(word =>
    word.length > 2 &&
    !['garantili', 'faturalı', 'sıfır', 'kutusunda', 'yeni', 'gb', 'tb', 'ram', 'ssd', 'hdd', 'wifi', 'bluetooth'].includes(word)
  )

  return productWords.slice(0, 3).join('').substring(0, 20)
}

async function updateListingImages() {
  const listings = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, baslik: true }
  })

  console.log(`${listings.length} aktif ilan bulundu. Ürünlere uygun resimler güncelleniyor...`)

  for (const listing of listings) {
    const productSeed = extractProductSeed(listing.baslik)

    // Ürüne özel resimler oluştur
    const images = [
      `https://picsum.photos/seed/${productSeed}1/800/600`,
      `https://picsum.photos/seed/${productSeed}2/800/600`
    ]

    await prisma.ilan.update({
      where: { id: listing.id },
      data: { resimler: JSON.stringify(images) }
    })

    console.log(`✓ ${listing.baslik}`)
    console.log(`  Seed: ${productSeed}`)
    console.log(`  Resimler: ${images.join(', ')}`)
    console.log('---')
  }

  console.log('🎉 Tüm ilan resimleri ürünlere uygun şekilde güncellendi!')
}

updateListingImages().catch(console.error)