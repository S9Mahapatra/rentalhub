import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from './mongodb';
import User from '@/models/User';
import { loginSchema } from './validation';

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: SEVEN_DAYS_IN_SECONDS },
  jwt: { maxAge: SEVEN_DAYS_IN_SECONDS },
  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        phone: { label: 'Phone', type: 'tel' },
      },
      async authorize(credentials) {
        // Same parser the register route uses, so "+91 98765 43210" typed at
        // sign-in matches the bare 9876543210 that was stored at sign-up.
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          phone: credentials?.phone,
        });
        if (!parsed.success) return null;

        await connectToDatabase();

        const user = await User.findOne({
          email: parsed.data.email,
          phone: parsed.data.phone,
        });
        if (!user) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profileImage,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      if (trigger === 'update' && session?.user) {
        token.name = session.user.name ?? token.name;
        token.email = session.user.email ?? token.email;
        token.picture = session.user.image ?? token.picture;
        token.role = session.user.role ?? token.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },
};
