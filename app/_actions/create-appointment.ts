"use server"

import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateAppointmentParams {
  dentistId: string
  serviceId: string
  patientId: string
  date: Date
}

export const createAppointment = async (params: CreateAppointmentParams) => {
  await db.appointment.create({
    data: {
      dentistId: params.dentistId,
      serviceId: params.serviceId,
      patientId: params.patientId,
      date: params.date,
    },
  })

  revalidatePath("/")
  revalidatePath("/appointments")
}
