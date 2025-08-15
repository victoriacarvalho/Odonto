"use server"

import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client"

// Define a interface para os parâmetros da função
interface UpsertTransactionParams {
  id?: string
  name: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  paymentMethod: TransactionPaymentMethod
  date: Date
}

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  const { id, ...data } = params

  if (id) {
    // Se estiver atualizando, o navasId não é alterado
    await db.transaction.update({
      where: { id },
      data,
    })
  } else {
    // Busca a primeira empresa (Navas) para obter o ID
    const navas = await db.navas.findFirst()

    if (!navas) {
      throw new Error("Nenhuma empresa encontrada para associar a transação.")
    }

    // Cria a transação usando o ID da empresa encontrado
    await db.transaction.create({
      data: {
        ...data,
        navasId: navas.id,
      },
    })
  }

  // Revalida os caminhos para atualizar os dados na interface
  revalidatePath("/")
  revalidatePath("/finance")
}
