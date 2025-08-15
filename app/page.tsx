import Header from "./_components/header"
import Image from "next/image"
import { db } from "./_lib/prisma"
import DentistItem from "./_components/DentistItem"
import AppointmentItem from "./_components/AppointmentItem"
import Search from "./_components/search"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { ptBR } from "date-fns/locale/pt-BR"
import { format } from "date-fns"
import HomeServiceItem from "./_components/HomeServiceItem" // Importa o novo componente

const Home = async () => {
  const session = await getServerSession(authOptions)

  const [dentists, services, confirmedAppointments] = await Promise.all([
    db.user.findMany({
      where: {
        role: "DENTISTA",
      },
      include: {
        dentistProfile: true,
      },
    }),
    db.service.findMany({
      take: 10,
      orderBy: {
        name: "asc",
      },
    }),
    session?.user
      ? db.appointment.findMany({
          where: {
            patientId: (session.user as any).id,
            date: {
              gte: new Date(),
            },
          },
          include: {
            service: true,
            dentist: {
              include: {
                dentistProfile: true,
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        })
      : Promise.resolve([]),
  ])

  return (
    <div>
      <Header />
      <div className="p-5">
        <h2 className="text-xl font-bold">
          Olá, {session?.user ? session.user.name?.split(" ")[0] : "bem-vindo"}!
        </h2>
        <p className="capitalize">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>

        <div className="mt-6">
          <Search />
        </div>

        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Banner"
            fill
            className="rounded-xl object-cover"
            src="/banner.png"
          />
        </div>

        {confirmedAppointments.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Próximas Consultas
            </h2>
            <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {confirmedAppointments.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Nossos Profissionais
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {dentists.map((dentist) => (
            <DentistItem key={dentist.id} dentist={dentist} />
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Serviços Populares
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {services.map((service) => (
            // Usa o novo componente HomeServiceItem
            <HomeServiceItem key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}
export default Home
