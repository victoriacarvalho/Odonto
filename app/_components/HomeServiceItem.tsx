import { Service } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface HomeServiceItemProps {
  service: Service
}

const HomeServiceItem = ({ service }: HomeServiceItemProps) => {
  return (
    <Card className="min-w-[167px] max-w-[167px] rounded-2xl">
      <CardContent className="p-3">
        <div className="relative h-[110px] w-full">
          <Image
            src={service.imageUrl ?? "/banner.png"}
            fill
            className="rounded-lg object-cover"
            alt={service.name}
          />
        </div>
        <div className="mt-2">
          <h3 className="truncate font-semibold">{service.name}</h3>
          <p className="mt-1 text-sm font-bold text-primary">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
          {/* Este botão leva para a página com a lista de todos os dentistas */}
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href="/appointments">Agendar</Link>{" "}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default HomeServiceItem
