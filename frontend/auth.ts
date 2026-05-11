import NextAuth from "next-auth";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";
import { db, users } from "./db";

/**
 * Full Auth.js config — Node runtime only (touches DB).
 *
 * Strategy: JWT (no DB sessions). On signIn, upsert the user in our
 * `users` table by `lineUserId`. Subsequent JWT enriches with our DB
 * `user_id` + `role` so server components can authorize without a
 * round-trip.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: true,
  // verbose error logging so OAuthCallbackError shows the underlying cause
  debug: process.env.NODE_ENV !== "production" || process.env.AUTH_DEBUG === "1",
  logger: {
    error(error: Error & { cause?: unknown }) {
      console.error("[auth][error]", error.name, error.message);
      if (error.cause) {
        // Underlying cause (LINE token endpoint response, invalid_client,
        // signature failure, etc.) — this is the actual root cause.
        console.error("[auth][error] cause:", error.cause);
        try {
          console.error(
            "[auth][error] cause-json:",
            JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause as object)),
          );
        } catch {
          /* ignore */
        }
      }
      console.error("[auth][error] stack:", error.stack);
    },
    warn(code: string) {
      console.warn("[auth][warn]", code);
    },
  },
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ profile, account }) {
      try {
        if (account?.provider !== "line") {
          console.warn("[signIn] Non-LINE provider, rejecting");
          return false;
        }
        const lineId = profile?.sub;
        if (!lineId) {
          console.error("[signIn] No `sub` in LINE profile", profile);
          return false;
        }

        const name =
          (profile?.name as string | undefined) ||
          (profile?.["display_name"] as string | undefined) ||
          "LINE User";
        const image = profile?.picture as string | undefined;
        const email = profile?.email as string | undefined;

        const existing = await db.query.users.findFirst({
          where: eq(users.lineUserId, lineId),
          columns: { id: true },
        });

        if (!existing) {
          await db.insert(users).values({
            lineUserId: lineId,
            name,
            image,
            email,
            role: "customer",
            status: "active",
          });
          console.log("[signIn] Created new user for LINE id", lineId);
        } else {
          await db
            .update(users)
            .set({ name, image, updatedAt: new Date() })
            .where(eq(users.id, existing.id));
          console.log("[signIn] Updated existing user", existing.id);
        }
        return true;
      } catch (e) {
        console.error("[signIn] Failed to upsert user:", e);
        // Returning false → Auth.js will render OAuthCallbackError, but
        // now we have the underlying exception in logs.
        return false;
      }
    },

    async jwt({ token, profile }) {
      try {
        const lineId =
          (profile?.sub as string | undefined) ??
          (token.lineId as string | undefined);
        if (lineId && !token.userId) {
          const u = await db.query.users.findFirst({
            where: eq(users.lineUserId, lineId),
            columns: { id: true, role: true, status: true },
          });
          if (u) {
            token.userId = u.id;
            token.role = u.role;
            token.status = u.status;
            token.lineId = lineId;
          }
        }
        return token;
      } catch (e) {
        console.error("[jwt] Failed to enrich token:", e);
        return token;
      }
    },
  },
});
