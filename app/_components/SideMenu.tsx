"use client"

import { Sheet, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import SidebarSheet from "./sidebar-sheet"
import { useSession } from "next-auth/react" // Importe o useSession aqui

const SideMenu = () => {
  const { data } = useSession() // Chame o hook aqui

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      {/* Passe os dados da sessão para baixo como uma prop */}
      <SidebarSheet session={data} />
    </Sheet>
  )
}

export default SideMenu
