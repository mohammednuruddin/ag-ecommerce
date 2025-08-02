import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);

        if (user.length === 0 || !user[0].password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user[0].password);

        if (!isValid) {
          return null;
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          image: user[0].image,
          role: user[0].role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
};