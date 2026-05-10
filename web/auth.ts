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
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ profile, account }) {
      if (account?.provider !== "line") return false;
      const lineId = profile?.sub;
      if (!lineId) return false;

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
      } else {
        await db
          .update(users)
          .set({ name, image, updatedAt: new Date() })
          .where(eq(users.id, existing.id));
      }
      return true;
    },

    async jwt({ token, profile }) {
      // On initial sign-in `profile` is set; on subsequent calls it's not,
      // so token already has the enriched fields.
      const lineId = (profile?.sub as string | undefined) ?? (token.lineId as string | undefined);
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
    },
  },
});
