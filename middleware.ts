import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permite que a página inicial e as rotas da API de autenticação sejam públicas
  if (pathname === "/" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Obtém o token da sessão
  const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET })

  // Se não houver token, redireciona para a página inicial para fazer login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Se o usuário tem token, verifica suas permissões
  const userRole = (token as any).role

  // Regras de acesso para o painel de admin/dentista
  if (pathname.startsWith("/finance")) {
    if (userRole !== "ADMIN" && userRole !== "DENTISTA") {
      // Se não for admin/dentista, redireciona para a página de agendamentos
      return NextResponse.redirect(new URL("/appointments", req.url))
    }
  }

  return NextResponse.next()
}

// Define quais rotas serão protegidas pelo middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|).*)"],
}
