import { PrismaClient } from '@prisma/client'

declare module '@prisma/client' {
  interface PrismaClient {
    user: any
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if ((prisma as any).kullanici && !(prisma as any).user) {
  ;(prisma as any).user = (prisma as any).kullanici
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
