"use server"

import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteAppointment = async (appointmentId: string) => {
  await db.appointment.delete({
    where: {
      id: appointmentId,
    },
  })

  revalidatePath("/")
  revalidatePath("/appointments")
}
