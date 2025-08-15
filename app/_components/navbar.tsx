"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import SignInDialog from "./sing-in-dialog"
import {
  CalendarIcon,
  DollarSignIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
} from "lucide-react"

const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data } = useSession()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const handleLogoutClick = () => signOut()

  const navLinks = [
    { href: "/", label: "Início", icon: HomeIcon },
    { href: "/bookings", label: "Agendamentos", icon: CalendarIcon },
    { href: "/finance", label: "Financeiro", icon: DollarSignIcon },
  ]

  return (
    <header className="border-b border-solid">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Lado Esquerdo: Logo e Links para Desktop */}
        <div className="flex items-center gap-10">
          <Link href="/">
            <Image
              src="/logo.png"
              width={170}
              height={38}
              alt="Navas Climatização"
            />
          </Link>
          <div className="hidden gap-8 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Lado Direito (Desktop): Autenticação */}
        <div className="hidden items-center gap-3 sm:flex">
          {data?.user ? (
            <>
              <Avatar>
                <AvatarImage src={data.user.image ?? ""} />
              </Avatar>
              <span className="text-sm font-medium">{data.user.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogoutClick}
                aria-label="Sair"
              >
                <LogOutIcon className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <LogInIcon className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Botão Hamburger (Mobile) */}
        <div className="sm:hidden">
          <Button
            size="icon"
            variant="outline"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </Button>
        </div>
      </nav>

      {/* Menu Overlay (Mobile) */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[85px] z-20 flex flex-col gap-2 border-b bg-card p-4 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}

          <div className="my-4 border-t border-border"></div>

          {/* Autenticação no Menu Mobile */}
          {data?.user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar>
                  <AvatarImage src={data.user.image ?? ""} />
                </Avatar>
                <span className="font-medium">{data.user.name}</span>
              </div>
              <Button
                variant="ghost"
                className="flex justify-start gap-3 px-3 py-2 text-base font-medium text-muted-foreground"
                onClick={() => {
                  handleLogoutClick()
                  setIsMenuOpen(false)
                }}
              >
                <LogOutIcon className="h-5 w-5" />
                Sair da conta
              </Button>
            </div>
          ) : (
            <Dialog onOpenChange={(open) => !open && setIsMenuOpen(false)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex justify-start gap-3 px-3 py-2 text-base font-medium text-muted-foreground"
                >
                  <LogInIcon className="h-5 w-5" />
                  Fazer Login
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
