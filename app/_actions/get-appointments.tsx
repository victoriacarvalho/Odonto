"use server"

import { db } from "../_lib/prisma"
import { endOfDay, startOfDay } from "date-fns"

interface GetDayAppointmentsParams {
  dentistId: string
  date: Date
}

// Busca os agendamentos para um dentista específico num determinado dia
export const getDayAppointments = async (params: GetDayAppointmentsParams) => {
  const appointments = await db.appointment.findMany({
    where: {
      dentistId: params.dentistId,
      date: {
        gte: startOfDay(params.date),
        lte: endOfDay(params.date),
      },
    },
  })
  return appointments
}
