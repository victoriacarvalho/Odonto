import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { redirect } from "next/navigation"
import { db } from "../_lib/prisma"
import AppointmentItem from "../_components/AppointmentItem"

const AppointmentsPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect("/")
  }

  const user: any = session.user

  // Define a consulta base
  const baseQuery = {
    include: {
      service: true,
      patient: true, // Incluímos o paciente para exibir o nome no card
      dentist: {
        include: {
          dentistProfile: true,
        },
      },
    },
  }

  // Adapta a consulta com base na role do usuário
  const confirmedAppointmentsQuery = {
    ...baseQuery,
    where: {
      date: { gte: new Date() },
      ...(user.role === "DENTISTA"
        ? { dentistId: user.id }
        : { patientId: user.id }),
    },
    orderBy: {
      date: "asc" as const,
    },
  }

  const finishedAppointmentsQuery = {
    ...baseQuery,
    where: {
      date: { lt: new Date() },
      ...(user.role === "DENTISTA"
        ? { dentistId: user.id }
        : { patientId: user.id }),
    },
    orderBy: {
      date: "desc" as const,
    },
  }

  const [confirmedAppointments, finishedAppointments] = await Promise.all([
    db.appointment.findMany(confirmedAppointmentsQuery),
    db.appointment.findMany(finishedAppointmentsQuery),
  ])

  return (
    <>
      <Header />
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold">
          {user.role === "DENTISTA" ? "Meus Agendamentos" : "Minhas Consultas"}
        </h1>

        {confirmedAppointments.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">
              Confirmadas
            </h2>
            <div className="flex flex-col gap-3">
              {confirmedAppointments.map((appointment: any) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </>
        )}

        {finishedAppointments.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">
              Finalizadas
            </h2>
            <div className="flex flex-col gap-3">
              {finishedAppointments.map((appointment: any) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AppointmentsPage
