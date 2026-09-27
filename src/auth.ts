import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase } from "@/lib/database";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.AUTH_SECRET ?? "development-only-replace-this-auth-secret",
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;
        const user = await getDatabase().adminUser.findUnique({
          where: { email },
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash)))
          return null;
        await getDatabase().adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "MANAGER" | "STAFF";
      }
      return session;
    },
  },
};
