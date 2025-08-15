import Header from "./_components/header"
import Image from "next/image"
import { db } from "./_lib/prisma"
import DentistItem from "./_components/dentist-item" // Renomeado de NavasItem
import ServiceItem from "./_components/service-item" // Renomeado de ServicesItem
import AppointmentItem from "./_components/appointment-item" // Renomeado de BookingItem
import Search from "./_components/search"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { ptBR } from "date-fns/locale/pt-BR"
import { format } from "date-fns"
import { Key } from "react"

const Home = async () => {
  const session = await getServerSession(authOptions)

  // Busca os profissionais (dentistas) e os serviços em paralelo
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
      take: 10, // Limita a 10 serviços para a home
      orderBy: {
        name: "asc",
      },
    }),
    // Busca agendamentos apenas se houver uma sessão de usuário
    session?.user
      ? db.appointment.findMany({
          where: {
            patientId: (session.user as any).id,
            date: {
              gte: new Date(), // Apenas agendamentos futuros
            },
          },
          include: {
            service: true,
            dentist: {
              select: {
                name: true,
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

        {/* BUSCA */}
        <div className="mt-6">
          <Search />
        </div>

        {/* BANNER */}
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Banner"
            fill
            className="rounded-xl object-cover"
            src="/banner.png"
          />
        </div>

        {/* AGENDAMENTOS */}
        {confirmedAppointments.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Próximos Agendamentos
            </h2>
            <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {confirmedAppointments.map(
                (appointment: { id: Key | null | undefined }) => (
                  <AppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                  />
                ),
              )}
            </div>
          </>
        )}

        {/* PROFISSIONAIS */}
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Nossos Profissionais
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {dentists.map((dentist) => (
            <DentistItem key={dentist.id} dentist={dentist} />
          ))}
        </div>

        {/* SERVIÇOS POPULARES */}
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Serviços Populares
        </h2>
        <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home