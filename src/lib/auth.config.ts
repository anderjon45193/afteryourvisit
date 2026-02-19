import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Node.js dependencies).
 * Used by middleware. The full config in auth.ts extends this.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  providers: [], // added in auth.ts (Credentials needs Node.js)
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
