import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

// In production, this would use Prisma to look up users.
// For development without a DB, we use a demo user.
const DEMO_USER = {
  id: "demo-user-1",
  email: "dr.patel@smiledentalcare.com",
  name: "Dr. Patel",
  role: "owner",
  businessId: "demo-biz-1",
  businessName: "Smile Dental Care",
  businessType: "dentist",
  // password: "demo1234"
  passwordHash: "$2b$10$GdRiNk2AanhiM1OOX1B1deetB9jhCx46CmFh7Mv7D6gQ.C4Q4Fp0W",
};

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        // In production: const user = await prisma.user.findUnique({ where: { email } });
        // For development, check against demo user
        if (email !== DEMO_USER.email) return null;

        const passwordMatch = await bcrypt.compare(password, DEMO_USER.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          role: DEMO_USER.role,
          businessId: DEMO_USER.businessId,
          businessName: DEMO_USER.businessName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role as string;
        token.businessId = (user as Record<string, unknown>).businessId as string;
        token.businessName = (user as Record<string, unknown>).businessName as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        user.role = token.role;
        user.businessId = token.businessId;
        user.businessName = token.businessName;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage =
        nextUrl.pathname.startsWith("/sign-in") ||
        nextUrl.pathname.startsWith("/sign-up");

      if (isDashboard && !isLoggedIn) {
        return Response.redirect(new URL("/sign-in", nextUrl));
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
