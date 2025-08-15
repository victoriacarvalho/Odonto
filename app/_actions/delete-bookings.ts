// app/_actions/delete-bookings.ts
"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/app/_lib/prisma"

export const deleteBooking = async (bookingId: string) => {
  await db.$transaction(async (prisma) => {
    const agendamentoParaDeletar = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        Transaction: true,
        NavasService: true,
      },
    })

    if (!agendamentoParaDeletar) {
      throw new Error("Agendamento não encontrado.")
    }

    if (agendamentoParaDeletar.Transaction) {
      await prisma.transaction.delete({
        where: {
          id: agendamentoParaDeletar.Transaction.id,
        },
      })
      console.log(
        `Transação ${agendamentoParaDeletar.Transaction.id} deletada para o agendamento ${bookingId}`,
      )
    } else {
      console.log(
        `Nenhuma transação associada encontrada para o agendamento ${bookingId}.`,
      )
    }

    // 3. Deleta o agendamento
    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    })

    const userIdDoAgendamento = agendamentoParaDeletar.userId
    const precoDoServico = agendamentoParaDeletar.NavasService.price

    if (userIdDoAgendamento) {
      try {
        await prisma.user.update({
          where: {
            id: userIdDoAgendamento,
          },
          data: {
            balance: {
              increment: precoDoServico,
            },
          },
        })
        console.log(
          `Saldo do usuário ${userIdDoAgendamento} atualizado em ${precoDoServico}.`,
        )
      } catch (error) {
        console.warn(
          `Aviso: Não foi possível atualizar o saldo do usuário ${userIdDoAgendamento}. Verifique se o campo 'balance' existe no modelo 'User'. Erro:`,
          error,
        )
      }
    }
  })

  revalidatePath("/bookings")
  revalidatePath("/transactions")
  revalidatePath("/")
}
