import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        sifre: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.sifre) {
          throw new Error('E-posta ve şifre gereklidir.')
        }

        const kullanici = await prisma.User.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!kullanici) {
          throw new Error('Bu e-posta adresi ile kayıtlı hesap bulunamadı.')
        }

        const sifreDogrumu = await bcrypt.compare(credentials.sifre, kullanici.sifre)

        if (!sifreDogrumu) {
          throw new Error('Şifre hatalı. Lütfen tekrar deneyin.')
        }

        return {
          id: kullanici.id,
          email: kullanici.email,
          name: kullanici.ad,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: '/giris',
    error: '/giris',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
}
