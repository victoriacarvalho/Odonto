"use client"
import { Service, Appointment, User } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { format, isPast, setHours, setMinutes } from "date-fns"
import { createAppointment } from "../_actions/create-appointment"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getDayAppointments } from "../_actions/get-appointments"
import { useRouter } from "next/navigation"
import SignInDialog from "./sing-in-dialog"
import { Dialog, DialogContent } from "./ui/dialog"

interface ServiceItemProps {
  service: Service
  dentist: User // Agora recebe o objeto completo do dentista
}

const ServiceItem = ({ service, dentist }: ServiceItemProps) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | undefined>()
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [sheetIsOpen, setSheetIsOpen] = useState(false)
  const [submitIsLoading, setSubmitIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedDay) return
    const fetchAppointments = async () => {
      const appointments = await getDayAppointments({
        date: selectedDay,
        dentistId: dentist.id,
      })
      setDayAppointments(appointments)
    }
    fetchAppointments()
  }, [selectedDay, dentist.id])

  const handleTimeClick = (time: string) => {
    setSelectedTime(time)
  }

  const handleBookingClick = () => {
    if (!session?.user) {
      return setSignInDialogIsOpen(true)
    }
    setSheetIsOpen(true)
  }

  const handleCreateAppointment = async () => {
    setSubmitIsLoading(true)
    try {
      if (!selectedDay || !selectedTime || !session?.user) return

      const hour = Number(selectedTime.split(":")[0])
      const minute = Number(selectedTime.split(":")[1])
      const newDate = setMinutes(setHours(selectedDay, hour), minute)

      await createAppointment({
        serviceId: service.id,
        dentistId: dentist.id,
        patientId: (session.user as any).id,
        date: newDate,
      })

      setSheetIsOpen(false)
      setSelectedDay(new Date())
      setSelectedTime(undefined)
      toast.success("Consulta agendada com sucesso!", {
        description: `Sua consulta para ${service.name} com ${dentist.name} foi agendada para ${format(newDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}.`,
        action: {
          label: "Visualizar",
          onClick: () => router.push("/appointments"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao agendar consulta!")
    } finally {
      setSubmitIsLoading(false)
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []

    const availableTimes = [
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ]

    return availableTimes.filter((time) => {
      const hour = Number(time.split(":")[0])
      const minute = Number(time.split(":")[1])
      const appointmentTime = setMinutes(setHours(selectedDay, hour), minute)

      const isTimeBooked = dayAppointments.some(
        (appointment) => format(appointment.date, "HH:mm") === time,
      )

      return !isPast(appointmentTime) && !isTimeBooked
    })
  }, [selectedDay, dayAppointments])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              src={service.imageUrl ?? "/banner.png"}
              fill
              className="rounded-lg object-cover"
              alt={service.name}
            />
          </div>
          <div className="w-full">
            <h3 className="overflow-auto text-sm font-semibold">
              {service.name}
            </h3>
            <p className="overflow-auto text-sm text-gray-400">
              {service.description}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBookingClick}
              >
                Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>

      <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
        <SheetContent className="p-0">
          <SheetHeader className="border-b border-solid px-5 py-6">
            <SheetTitle>Fazer Agendamento</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              locale={ptBR}
              fromDate={new Date()}
              className="mt-0 pt-0"
              styles={{
                head_cell: { width: "100%", textTransform: "capitalize" },
                cell: { width: "100%" },
                button: { width: "100%" },
                nav_button_previous: { width: "32px", height: "32px" },
                nav_button_next: { width: "32px", height: "32px" },
                caption: { textTransform: "capitalize" },
              }}
            />
          </div>
          {selectedDay && (
            <div className="flex gap-3 overflow-x-auto border-y border-solid px-5 py-6 [&::-webkit-scrollbar]:hidden">
              {timeList.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => handleTimeClick(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
          <div className="px-5 py-6">
            <Card>
              <CardContent className="flex flex-col gap-3 p-3">
                <div className="flex justify-between">
                  <h3 className="font-bold">{service.name}</h3>
                  <h4 className="text-sm font-bold">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(service.price))}
                  </h4>
                </div>
                {selectedDay && (
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Data</p>
                    <p className="text-sm">
                      {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">Horário</p>
                    <p className="text-sm">{selectedTime}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <p className="text-sm text-gray-400">Profissional</p>
                  <p className="text-sm">{dentist.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <SheetFooter className="px-5">
            <Button
              className="w-full"
              onClick={handleCreateAppointment}
              disabled={!selectedDay || !selectedTime || submitIsLoading}
            >
              {submitIsLoading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ServiceItem
