import { prisma } from '../lib/prisma'

async function updateListingImages() {
  const listings = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, baslik: true }
  })

  console.log(`${listings.length} aktif ilan bulundu. Resimler güncelleniyor...`)

  for (const listing of listings) {
    // Başlıktan uygun seed oluştur
    const seed = listing.baslik
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Sadece harf ve rakam
      .substring(0, 20) // İlk 20 karakter

    // İki farklı resim oluştur
    const images = [
      `https://picsum.photos/seed/${seed}1/800/600`,
      `https://picsum.photos/seed/${seed}2/800/600`
    ]

    await prisma.ilan.update({
      where: { id: listing.id },
      data: { resimler: JSON.stringify(images) }
    })

    console.log(`✓ ${listing.baslik} - Resimler güncellendi`)
  }

  console.log('🎉 Tüm ilan resimleri güncellendi!')
}

updateListingImages().catch(console.error)