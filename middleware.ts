import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Deixa as rotas de API do NextAuth e a página de login passarem
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Obtém o token da sessão
  const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET });

  // Se não há token e a rota não é a home, redireciona para a home para fazer login
  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Se o usuário tem token, verifica suas permissões
  if (token) {
    const userRole = (token as any).role;

    // Regras de acesso para o painel de admin/dentista
    if (pathname.startsWith("/finance")) {
      if (userRole !== "ADMIN" && userRole !== "DENTISTA") {
        // Se não for admin/dentista, redireciona para a página de agendamentos
        return NextResponse.redirect(new URL("/bookings", req.url));
      }
    }

    // Regras de acesso para o painel do paciente
    if (pathname.startsWith("/bookings")) {
      if (userRole !== "PACIENTE") {
        // Se não for paciente, redireciona para o painel financeiro
        return NextResponse.redirect(new URL("/finance", req.url));
      }
    }
  }

  return NextResponse.next();
}

// Define quais rotas serão protegidas pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para:
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (ícone)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
