"use server"

import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { revalidatePath } from "next/cache"

interface CreateBookingParams {
  serviceId: string
  date: Date
  observacoes: string
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)

  if (!user) {
    throw new Error("Usuário não autenticado.")
  }

  const service = await db.navasService.findUnique({
    where: {
      id: params.serviceId,
    },
    include: {
      Navas: true,
    },
  })

  if (!service) {
    throw new Error("Serviço não encontrado.")
  }

  const transaction = await db.transaction.create({
    data: {
      name: service.name,
      type: "DEPOSIT",
      amount: service.price,
      category: "SERVICE_PAYMENT",
      // TODO: Obter o método de pagamento do usuário
      paymentMethod: "OTHER",
      date: params.date,
      navasId: service.NavasId,
    },
  })

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      date: params.date,
      description: params.observacoes,
      userId: (user.user as any).id,
      transactionId: transaction.id,
    },
  })

  revalidatePath("/navas[id]")
  revalidatePath("/bookings")
}
