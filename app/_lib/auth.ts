import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { db } from "./prisma";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // O callback de session é executado sempre que uma sessão é verificada.
    async session({ session, user }) {
      // 1. Busca o usuário no banco de dados pelo ID para obter a 'role'
      const userFromDb = await db.user.findUnique({
        where: { id: user.id },
      });

      // 2. Adiciona o ID e a 'role' ao objeto da sessão
      session.user = {
        ...session.user,
        id: user.id,
        role: userFromDb?.role, // Adiciona a role aqui!
      } as any; // O 'as any' é usado aqui para estender o tipo padrão do usuário da sessão

      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
