import { prisma } from '../lib/prisma'

function getProductSearchTerm(title: string): string {
  const lowerTitle = title.toLowerCase()

  // Ürün kategorilerine göre arama terimleri
  if (lowerTitle.includes('rtx') || lowerTitle.includes('gtx') || lowerTitle.includes('rx')) {
    return 'graphics card gaming'
  }
  if (lowerTitle.includes('iphone') || lowerTitle.includes('galaxy') || lowerTitle.includes('pixel')) {
    return 'smartphone mobile phone'
  }
  if (lowerTitle.includes('macbook') || lowerTitle.includes('thinkpad') || lowerTitle.includes('dell')) {
    return 'laptop computer'
  }
  if (lowerTitle.includes('playstation') || lowerTitle.includes('xbox') || lowerTitle.includes('nintendo')) {
    return 'gaming console video games'
  }
  if (lowerTitle.includes('ipad') || lowerTitle.includes('tablet')) {
    return 'tablet computer'
  }
  if (lowerTitle.includes('monitor') || lowerTitle.includes('ekran')) {
    return 'computer monitor display'
  }
  if (lowerTitle.includes('mouse') || lowerTitle.includes('keyboard')) {
    return 'computer peripherals gaming'
  }
  if (lowerTitle.includes('ram') || lowerTitle.includes('ssd') || lowerTitle.includes('hard disk')) {
    return 'computer hardware technology'
  }
  if (lowerTitle.includes('headphone') || lowerTitle.includes('kulaklık') || lowerTitle.includes('airpods')) {
    return 'headphones audio wireless'
  }

  // Genel fallback
  return 'technology electronics'
}

async function updateListingImages() {
  const listings = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, baslik: true, kategori: true }
  })

  console.log(`${listings.length} aktif ilan bulundu. Kategoriye uygun resimler güncelleniyor...`)

  for (const listing of listings) {
    const searchTerm = getProductSearchTerm(listing.baslik)
    const category = listing.kategori.toLowerCase()

    // Unsplash API ile ürün resimleri
    const images = [
      `https://source.unsplash.com/featured/?${encodeURIComponent(searchTerm)},${encodeURIComponent(category)}/800x600`,
      `https://source.unsplash.com/featured/?${encodeURIComponent(searchTerm)},technology/800x600`
    ]

    await prisma.ilan.update({
      where: { id: listing.id },
      data: { resimler: JSON.stringify(images) }
    })

    console.log(`✓ ${listing.baslik}`)
    console.log(`  Kategori: ${listing.kategori}`)
    console.log(`  Arama: ${searchTerm}`)
    console.log(`  Resimler: ${images[0].substring(0, 80)}...`)
    console.log('---')
  }

  console.log('🎉 Tüm ilan resimleri kategoriye uygun şekilde güncellendi!')
}

updateListingImages().catch(console.error)