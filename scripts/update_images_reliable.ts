import { prisma } from '../lib/prisma'

function getProductImageUrl(productType: string, index: number = 1): string {
  const seeds: Record<string, string[]> = {
    'rtx4090': ['gpu', 'graphics-card', 'gaming-pc', 'nvidia'],
    'iphone15': ['smartphone', 'mobile-phone', 'apple-phone', 'ios'],
    'macbook': ['laptop', 'computer', 'apple-laptop', 'mac'],
    'playstation5': ['gaming-console', 'ps5', 'sony-console', 'video-games'],
    'galaxys24': ['android-phone', 'samsung-phone', 'mobile', 'smartphone'],
    'xbox': ['gaming-console', 'microsoft-console', 'xbox-series', 'games'],
    'nintendo': ['nintendo-switch', 'handheld-console', 'gaming', 'portable'],
    'headphones': ['audio', 'wireless-headphones', 'sony-audio', 'music'],
    'mouse': ['gaming-mouse', 'computer-peripheral', 'logitech', 'pc-accessory'],
    'monitor': ['computer-monitor', 'display', 'gaming-monitor', 'screen'],
    'ram': ['computer-memory', 'hardware', 'technology', 'pc-parts'],
    'motherboard': ['computer-hardware', 'pc-components', 'technology', 'electronics'],
    'tablet': ['ipad', 'tablet-computer', 'apple-tablet', 'mobile-device'],
    'processor': ['cpu', 'computer-chip', 'amd-processor', 'hardware']
  }

  const productSeeds = seeds[productType] || ['technology', 'electronics', 'computer']
  const seed = productSeeds[(index - 1) % productSeeds.length]

  return `https://loremflickr.com/800/600?lock=${seed.length}&random=1`
}

function extractProductType(title: string): string {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('rtx 4090') || lowerTitle.includes('rtx4090')) return 'rtx4090'
  if (lowerTitle.includes('iphone 15') || lowerTitle.includes('iphone15')) return 'iphone15'
  if (lowerTitle.includes('macbook') || lowerTitle.includes('macbook pro')) return 'macbook'
  if (lowerTitle.includes('playstation 5') || lowerTitle.includes('ps5')) return 'playstation5'
  if (lowerTitle.includes('galaxy s24') || lowerTitle.includes('samsung')) return 'galaxys24'
  if (lowerTitle.includes('xbox')) return 'xbox'
  if (lowerTitle.includes('nintendo') || lowerTitle.includes('switch')) return 'nintendo'
  if (lowerTitle.includes('headphone') || lowerTitle.includes('kulaklık') || lowerTitle.includes('sony wh')) return 'headphones'
  if (lowerTitle.includes('mouse') || lowerTitle.includes('logitech g')) return 'mouse'
  if (lowerTitle.includes('monitor') || lowerTitle.includes('monitör')) return 'monitor'
  if (lowerTitle.includes('ram') || lowerTitle.includes('ddr5')) return 'ram'
  if (lowerTitle.includes('motherboard') || lowerTitle.includes('anakart')) return 'motherboard'
  if (lowerTitle.includes('tablet') || lowerTitle.includes('ipad')) return 'tablet'
  if (lowerTitle.includes('ryzen') || lowerTitle.includes('processor') || lowerTitle.includes('cpu')) return 'processor'

  return 'technology' // fallback
}

async function updateListingImages() {
  const listings = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, baslik: true }
  })

  console.log(`${listings.length} aktif ilan bulundu. Güvenilir resimler güncelleniyor...`)

  for (const listing of listings) {
    const productType = extractProductType(listing.baslik)

    const images = [
      getProductImageUrl(productType, 1),
      getProductImageUrl(productType, 2)
    ]

    await prisma.ilan.update({
      where: { id: listing.id },
      data: { resimler: JSON.stringify(images) }
    })

    console.log(`✓ ${listing.baslik}`)
    console.log(`  Ürün: ${productType}`)
    console.log(`  Resimler: ${images.join(', ')}`)
    console.log('---')
  }

  console.log('🎉 Tüm ilan resimleri güvenilir şekilde güncellendi!')
}

updateListingImages().catch(console.error)