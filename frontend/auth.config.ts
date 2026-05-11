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
      // Drop `email` from the default scope. LINE requires a separate
      // approval ("Email permission" application) — requesting `email` scope
      // without it can fail the OIDC token verification step.
      authorization: { params: { scope: "openid profile" } },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = path.startsWith("/auth/");

      // Protect dashboard routes only. /clinics/[id] (public detail, with 's')
      // is intentionally NOT matched here — it's a public discovery page.
      const isProtected =
        path === "/sale" || path.startsWith("/sale/") ||
        path === "/clinic" || path.startsWith("/clinic/") ||
        path === "/candidate" || path.startsWith("/candidate/") ||
        path === "/admin" || path.startsWith("/admin/");

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("next", path);
        return Response.redirect(loginUrl);
      }

      // /admin is admin-only (no self-promotion path)
      const isAdminRoute = path === "/admin" || path.startsWith("/admin/");
      if (isAdminRoute && isLoggedIn && auth.user.role !== "admin") {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isAuthRoute && isLoggedIn && path === "/auth/login") {
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
