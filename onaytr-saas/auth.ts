import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { getSystemSetting } from '@/lib/settings';
import * as OTPAuth from 'otpauth';

export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
  const dbGoogleClientId = await getSystemSetting('GOOGLE_CLIENT_ID');
  const dbGoogleClientSecret = await getSystemSetting('GOOGLE_CLIENT_SECRET');

  return {
    providers: [
      Google({
        clientId: dbGoogleClientId || process.env.GOOGLE_CLIENT_ID || 'placeholder',
        clientSecret: dbGoogleClientSecret || process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
        // Runtime'da DB'den key'leri okumak için authorization endpoint override
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        },
      }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "E-Posta", type: "email" },
        password: { label: "Şifre", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
        twoFACode: { label: "2FA Kodu", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Turnstile doğrulama
          const turnstileSecret = await getSystemSetting('TURNSTILE_SECRET_KEY');
          if (turnstileSecret && credentials.turnstileToken) {
            const isValid = await verifyTurnstileToken(credentials.turnstileToken as string);
            if (!isValid) {
              throw new Error('Bot doğrulaması başarısız');
            }
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user) {
            return null;
          }

          if (user.isBanned) {
            throw new Error('Hesabınız yasaklanmıştır');
          }

          if (!user.passwordHash) {
            throw new Error('Bu hesap Google ile oluşturulmuştur. Lütfen Google ile giriş yapın.');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string, 
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          // 2FA Kontrolü
          if (user.twoFAEnabled) {
            const code = credentials.twoFACode as string;
            if (!code) {
              throw new Error('2FA_REQUIRED');
            }

            if (!user.twoFASecret) {
              throw new Error('2FA yapılandırması eksik');
            }

            const totp = new OTPAuth.TOTP({
              issuer: 'OnayTR',
              label: user.email,
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              secret: OTPAuth.Secret.fromBase32(user.twoFASecret),
            });

            const delta = totp.validate({ token: code, window: 1 });
            if (delta === null) {
              throw new Error('Geçersiz 2FA kodu');
            }
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            balance: parseFloat(user.balance.toString()),
          };
        } catch (error) {
          console.error('[NextAuth] authorize error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email }
          });

          if (dbUser) {
            if (!dbUser.googleId && profile.sub) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { googleId: profile.sub }
              });
            }
            if (dbUser.isBanned) {
              return false;
            }
          } else {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                googleId: profile.sub,
                balance: 0.0,
              }
            });
          }
          return true;
        } catch (error) {
          console.error('[NextAuth] Google signIn error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      const u = user as any;
      
      if (u && account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: u.email! }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.balance = parseFloat(dbUser.balance.toString());
        }
      } else if (u) {
        token.id = u.id;
        token.role = u.role;
        token.balance = u.balance;
      }
      
      if (trigger === 'update' && session?.balance !== undefined) {
        token.balance = session.balance;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).balance = token.balance;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
  };
});
