import { Navas } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface NavasItemProps {
  navas: Navas
}

const NavasItem = ({ navas }: NavasItemProps) => {
  return (
    <Card className="min-w-[167px] rounded-2xl">
      <CardContent className="p-0 px-1 pb-2 pt-1">
        {/* Imagem */}
        <div className="relative h-[159px] w-full">
          <Image
            fill
            className="rounded-2xl object-cover"
            src={navas.imageUrl}
            alt={navas.name}
          />
        </div>
        {/* Texto */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{navas.name}</h3>
          <p className="truncate text-sm text-gray-400">{navas.description}</p>
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href={`/navas/${navas.id}`}> Ver mais</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default NavasItem
