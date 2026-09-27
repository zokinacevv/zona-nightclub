import "next-auth";

declare module "next-auth" {
  interface User {
    role: "MANAGER" | "STAFF";
  }
  interface Session {
    user: { id: string; role: "MANAGER" | "STAFF" } & NonNullable<
      Session["user"]
    >;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "MANAGER" | "STAFF";
  }
}
