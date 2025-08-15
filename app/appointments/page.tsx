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

  const [confirmedAppointments, finishedAppointments] = await Promise.all([
    db.appointment.findMany({
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
    }),
    db.appointment.findMany({
      where: {
        patientId: (session.user as any).id,
        date: {
          lt: new Date(),
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
        date: "desc",
      },
    }),
  ])

  return (
    <>
      <Header />
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold">Minhas Consultas</h1>

        {confirmedAppointments.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">
              Confirmadas
            </h2>
            <div className="flex flex-col gap-3">
              {confirmedAppointments.map((appointment) => (
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
              {finishedAppointments.map((appointment) => (
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
