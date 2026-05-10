import type { NextAuthConfig } from "next-auth";
import LINE from "next-auth/providers/line";

/**
 * Edge-safe portion of Auth.js config — usable in middleware (which runs on
 * Edge runtime where Node-only deps like `pg`/`@neondatabase/serverless`
 * can't load).
 *
 * No `signIn` / `jwt` callbacks here that touch the DB. Those live in
 * `auth.ts` (Node runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    LINE({
      clientId: process.env.LINE_CHANNEL_ID,
      clientSecret: process.env.LINE_CHANNEL_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith("/auth/");
      const isProtected =
        nextUrl.pathname.startsWith("/sale") ||
        nextUrl.pathname.startsWith("/clinic") ||
        nextUrl.pathname.startsWith("/admin");

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("next", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }
      if (isAuthRoute && isLoggedIn && nextUrl.pathname === "/auth/login") {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      if (token.role)   session.user.role = token.role as string;
      if (token.status) session.user.status = token.status as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
