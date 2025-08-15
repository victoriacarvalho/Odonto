"use client"
import { Prisma } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import { Button } from "@/app/_components/ui/button"
import { deleteAppointment } from "../_actions/delete-appointment"
import { toast } from "sonner"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"

interface AppointmentItemProps {
  appointment: Prisma.AppointmentGetPayload<{
    include: {
      service: true
      dentist: {
        include: {
          dentistProfile: true
        }
      }
    }
  }>
}

const AppointmentItem = ({ appointment }: AppointmentItemProps) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const isAppointmentFinished = isPast(appointment.date)

  const handleCancelClick = async () => {
    setIsDeleteLoading(true)
    try {
      await deleteAppointment(appointment.id)
      toast.success("Consulta cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar a consulta.")
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="min-w-full">
          <CardContent className="flex p-0">
            <div className="flex flex-[3] flex-col gap-2 py-5 pl-5">
              <Badge
                variant={isAppointmentFinished ? "secondary" : "default"}
                className="w-fit"
              >
                {isAppointmentFinished ? "Finalizada" : "Confirmada"}
              </Badge>
              <h3 className="font-semibold">{appointment.service.name}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      appointment.dentist.dentistProfile?.profileImageUrl ??
                      appointment.dentist.image ??
                      undefined
                    }
                  />
                  <AvatarFallback>
                    {appointment.dentist.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm">{appointment.dentist.name}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center border-l border-solid">
              <p className="text-sm capitalize">
                {format(appointment.date, "MMMM", { locale: ptBR })}
              </p>
              <p className="text-2xl">{format(appointment.date, "dd")}</p>
              <p className="text-sm">{format(appointment.date, "HH:mm")}</p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="px-0">
        <SheetHeader className="border-b border-solid px-5 pb-6 text-left">
          <SheetTitle>Informações da Consulta</SheetTitle>
        </SheetHeader>

        <div className="px-5">
          <div className="relative mt-6 h-[180px] w-full">
            <Image src="/map.png" fill alt="Localização" />
            <div className="absolute bottom-4 left-0 w-full px-5">
              <Card>
                <CardContent className="flex gap-2 p-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        appointment.dentist.dentistProfile?.profileImageUrl ??
                        appointment.dentist.image ??
                        undefined
                      }
                    />
                  </Avatar>
                  <div>
                    <h2 className="font-bold">{appointment.dentist.name}</h2>
                    <h3 className="overflow-hidden text-ellipsis text-nowrap text-xs">
                      {appointment.dentist.dentistProfile?.specialization}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Badge
            variant={isAppointmentFinished ? "secondary" : "default"}
            className="my-3 w-fit"
          >
            {isAppointmentFinished ? "Finalizada" : "Confirmada"}
          </Badge>

          <Card>
            <CardContent className="flex flex-col gap-3 p-3">
              <div className="flex justify-between">
                <h3 className="font-bold">{appointment.service.name}</h3>
                <h4 className="text-sm font-bold">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(appointment.service.price))}
                </h4>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-400">Data</p>
                <p className="text-sm">
                  {format(appointment.date, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-400">Horário</p>
                <p className="text-sm">{format(appointment.date, "HH:mm")}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-400">Profissional</p>
                <p className="text-sm">{appointment.dentist.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="mt-6 flex-row gap-3 px-5">
          <SheetClose asChild>
            <Button className="w-full" variant="secondary">
              Voltar
            </Button>
          </SheetClose>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                variant="destructive"
                disabled={isAppointmentFinished || isDeleteLoading}
              >
                {isDeleteLoading ? "Cancelando..." : "Cancelar Consulta"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%]">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar esta consulta? Esta ação não
                  poderá ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-3">
                <AlertDialogCancel className="mt-0 w-full">
                  Voltar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="w-full"
                  onClick={handleCancelClick}
                  disabled={isDeleteLoading}
                >
                  {isDeleteLoading ? "Cancelando..." : "Confirmar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default AppointmentItem
