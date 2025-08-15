"use client"

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { signIn, signOut } from "next-auth/react"
import { Session } from "next-auth"

interface SidebarSheetProps {
  session: Session | null | undefined
}

const SidebarSheet = ({ session }: SidebarSheetProps) => {
  const handleLogoutClick = () => signOut()
  const handleLoginClick = () => signIn("google")

  return (
    <SheetContent className="p-0">
      <SheetHeader className="border-b border-solid p-5 text-left">
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>

      {session?.user ? (
        // Seção para usuário logado
        <div className="flex h-full flex-col justify-between px-5 py-6">
          <div>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={session.user.image ?? ""} />
              </Avatar>
              <h2 className="font-bold">{session.user.name}</h2>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/">
                  <>
                    <HomeIcon size={18} />
                    Início
                  </>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/appointments">
                  <>
                    <CalendarIcon size={18} />
                    Agendamentos
                  </>
                </Link>
              </Button>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={handleLogoutClick}
          >
            <LogOutIcon size={18} />
            Sair
          </Button>
        </div>
      ) : (
        // Seção para usuário não logado
        <div className="flex flex-col gap-3 px-5 py-6">
          <div className="flex items-center gap-2">
            <UserIcon size={32} />
            <h2 className="font-bold">Olá, faça seu login!</h2>
          </div>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={handleLoginClick}
          >
            <LogInIcon size={18} />
            Fazer Login
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
