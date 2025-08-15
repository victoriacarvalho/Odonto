// "use client" foi removido. Este é agora um Componente de Servidor.

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import Link from "next/link"
import SideMenu from "./SideMenu" // Importa o novo componente de cliente

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-2">
        <Link href="/">
          <Image alt="Logo" width={170} height={38} src="/logo.png" />
        </Link>

        {/* Usa o componente que encapsula a lógica do lado do cliente */}
        <SideMenu />
      </CardContent>
    </Card>
  )
}

export default Header
