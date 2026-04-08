import { prisma } from '../lib/prisma'

async function checkListings() {
  const listings = await prisma.ilan.findMany({
    where: { durum: 'AKTIF' },
    select: { id: true, baslik: true, resimler: true },
    take: 5
  })

  console.log('Aktif İlanlar:')
  listings.forEach(listing => {
    console.log(`${listing.id}: ${listing.baslik}`)
    console.log(`Resimler: ${listing.resimler}`)
    console.log('---')
  })
}

checkListings().catch(console.error)