import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET })

  // Se não há token, o usuário não está logado. Redireciona para a home.
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Lógica de autorização baseada na role do usuário
  const userRole = (token as any).role

  // Protege a rota /finance
  if (pathname.startsWith("/finance")) {
    if (userRole !== "ADMIN" && userRole !== "DENTISTA") {
      // Se não for autorizado, redireciona para a página de agendamentos
      return NextResponse.redirect(new URL("/appointments", req.url))
    }
  }

  // Se passou por todas as verificações, permite o acesso
  return NextResponse.next()
}

// Define EXATAMENTE quais rotas são protegidas pelo middleware.
// A página inicial ('/') e as rotas de API não estão nesta lista,
// portanto, permanecem públicas e não acionam o middleware.
export const config = {
  matcher: ["/appointments/:path*", "/dentists/:path*", "/finance/:path*"],
}
