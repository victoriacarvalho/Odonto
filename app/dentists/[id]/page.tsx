import { db } from "@/app/_lib/prisma"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import ServiceItem from "@/app/_components/ServiceItem"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import Header from "@/app/_components/header"

interface DentistProfilePageProps {
  params: {
    id: string
  }
}

const DentistProfilePage = async ({ params }: DentistProfilePageProps) => {
  const session = await getServerSession(authOptions)

  // Se o usuário for um dentista e estiver acessando seu próprio perfil, redirecione para os agendamentos
  if (
    session?.user &&
    (session.user as any).role === "DENTISTA" &&
    (session.user as any).id === params.id
  ) {
    return redirect("/appointments")
  }

  const dentist = await db.user.findUnique({
    where: {
      id: params.id,
      role: "DENTISTA",
    },
    include: {
      dentistProfile: true,
      dentistServices: {
        include: {
          service: true,
        },
      },
    },
  })

  if (!dentist || !dentist.dentistProfile) {
    return notFound()
  }

  return (
    <div>
      <Header />
      <div className="relative h-[250px] w-full">
        <Image
          src={dentist.dentistProfile.profileImageUrl ?? "/banner.png"}
          alt={dentist.name ?? "Perfil do Dentista"}
          fill
          className="object-cover"
        />
      </div>
      <div className="px-5 pb-8 pt-3">
        <h1 className="text-2xl font-bold">{dentist.name}</h1>
        <p className="text-sm text-gray-400">
          {dentist.dentistProfile.specialization}
        </p>
        <div className="mt-4 border-t border-solid pt-4">
          <h2 className="mb-3 text-lg font-semibold">Sobre</h2>
          <p className="text-sm text-gray-400">{dentist.dentistProfile.bio}</p>
        </div>
        <div className="mt-4 border-t border-solid pt-4">
          <h2 className="mb-3 text-lg font-semibold">Serviços Oferecidos</h2>
          <div className="flex flex-col gap-4">
            {dentist.dentistServices.map(({ service }) => (
              <ServiceItem
                key={service.id}
                service={service}
                dentist={dentist}
                isAuthenticated={!!session?.user}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DentistProfilePage
