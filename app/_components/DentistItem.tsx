import { User, DentistProfile } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface DentistItemProps {
  dentist: User & {
    dentistProfile: DentistProfile | null
  }
}

const DentistItem = ({ dentist }: DentistItemProps) => {
  return (
    <Card className="min-w-[167px] max-w-[167px] rounded-2xl">
      <CardContent className="px-1 py-1">
        <div className="relative h-[159px] w-full">
          <Image
            fill
            className="rounded-2xl object-cover"
            src={
              dentist.dentistProfile?.profileImageUrl ??
              dentist.image ??
              "/banner.png"
            }
            alt={dentist.name ?? "Dentista"}
          />
        </div>
        <div className="px-2 py-2">
          <h3 className="truncate font-semibold">{dentist.name}</h3>
          <p className="truncate text-sm text-gray-400">
            {dentist.dentistProfile?.specialization}
          </p>
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href={`/dentists/${dentist.id}`}>Ver Perfil</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DentistItem
