import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "sale" | "clinic" | "customer";
      status: "active" | "pending" | "blocked";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    status?: string;
    lineId?: string;
  }
}
