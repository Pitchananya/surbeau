import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge-runtime middleware uses authConfig (no DB calls).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon
     * - static assets (svg, png, jpg, etc)
     * - api/auth/* (Auth.js handles its own routes)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
