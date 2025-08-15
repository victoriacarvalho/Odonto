import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import SidebarSheet from "./sidebar-sheet"
import { Button } from "./ui/button"
import { Sheet, SheetTrigger } from "./ui/sheet"
import { MenuIcon } from "lucide-react"
import Link from "next/link"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-2">
        <Link href="/">
          <Image alt="Logo" width={170} height={38} src="/logo.png" />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
