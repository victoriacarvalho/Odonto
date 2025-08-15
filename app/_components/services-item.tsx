import { NavasService } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface ServicesItemProps {
  navasService: NavasService
}

const ServicesItem = ({ navasService }: ServicesItemProps) => {
  return (
    <Card className="min-w-[167px] rounded-2xl">
      <CardContent className="p-0 px-1 pb-2 pt-1">
        {/* Imagem */}
        <div className="relative h-[159px] w-full">
          <Image
            fill
            className="rounded-2xl object-cover"
            src={navasService.imageUrl}
            alt={navasService.name}
          />
        </div>
        {/* Texto */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{navasService.name}</h3>
          <p className="truncate text-sm text-gray-400">
            {navasService.description}
          </p>
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href={`/navas/${202507}`}>Agendar </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServicesItem
