"use client"
import { Booking, NavasService } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { format, isPast, isToday, set } from "date-fns"
import { Textarea } from "./ui/textarea"
import { createBooking } from "../_actions/create-bookings"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sing-in-dialog"

interface ServiceItemProps {
  service: NavasService
}

const TIME_LIST = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

interface GetTimeListProps {
  bookings: Booking[]
  selectedDay: Date
}

const getTimeList = ({ bookings, selectedDay }: GetTimeListProps) => {
  return TIME_LIST.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    const timeIsOnThePast = isPast(set(new Date(), { hours: hour, minutes }))
    if (timeIsOnThePast && isToday(selectedDay)) {
      return false
    }

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() === hour &&
        booking.date.getMinutes() === minutes,
    )
    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const { data } = useSession()
  const [observacoes, setObservacoes] = useState("")
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id])

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDay || !selectedTime) {
        toast.error("Por favor, selecione uma data e um horário.")
        return
      }
      const hour = Number(selectedTime.split(":")[0])
      const minute = Number(selectedTime.split(":")[1])
      const newDate = set(selectedDay, {
        hours: hour,
        minutes: minute,
      })

      await createBooking({
        serviceId: service.id,
        observacoes: observacoes,
        date: newDate,
      })

      handleBookingSheetOpenChange()
      toast.success("Agendamento criado com sucesso!")
      setObservacoes("")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar agendamento!")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({
      bookings: dayBookings,
      selectedDay,
    })
  }, [dayBookings, selectedDay])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* Imagem */}

          <div className="relative max-h-[180px] min-h-[180px] min-w-[150px] max-w-[150px]">
            <Image
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
              alt={service.name}
            />
          </div>
          {/* Direita */}
          <div className="w-full space-y-2">
            <h3 className="overflow-auto text-sm font-semibold">
              {service.name}
            </h3>
            <p className="overflow-auto text-sm text-gray-400">
              {service.description}
            </p>
            {/* Preço e botão */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">
                {Intl.NumberFormat("pt-br", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>
              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Agendar
                </Button>
                <SheetContent className="flex flex-col">
                  <SheetHeader className="px-5 text-center">
                    <SheetTitle>Agendar</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    {" "}
                    <div className="overflow-x-auto border-b border-solid py-5">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={handleDateSelect}
                        className="w-full"
                        disabled={{
                          before: new Date(),
                        }}
                        styles={{
                          head_cell: {
                            width: "100%",
                            textTransform: "capitalize",
                          },
                          cell: {
                            width: "100%",
                          },
                          button: {
                            width: "100%",
                          },
                          nav_button_previous: {
                            width: "32px",
                            height: "32px",
                          },
                          nav_button_next: {
                            width: "32px",
                            height: "32px",
                          },
                          caption: {
                            textTransform: "capitalize",
                          },
                        }}
                      />
                    </div>
                    {selectedDay && (
                      <div className="flex gap-3 overflow-x-auto border-b border-solid p-5 [&::-webkit-scrollbar]:hidden">
                        {timeList.length > 0 ? (
                          timeList.map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              className="rounded-full"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))
                        ) : (
                          <p className="text-xs">
                            Não há horários disponíveis para este dia.
                          </p>
                        )}
                      </div>
                    )}
                    {selectedTime && selectedDay && (
                      <div className="p-5">
                        <Card>
                          <CardContent className="space-y-3 p-3">
                            <div className="flex items-center justify-between">
                              <h2 className="font-bold">{service.name}</h2>
                              <p className="text-sm font-bold">
                                {Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(Number(service.price))}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <h2 className="text-sm text-gray-400">Data</h2>
                              <p className="text-sm">
                                {format(
                                  selectedDay ?? new Date(),
                                  "d 'de' MMMM",
                                  {
                                    locale: ptBR,
                                  },
                                )}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <h2 className="text-sm text-gray-400">Horário</h2>
                              <p className="text-sm">{selectedTime}</p>
                            </div>

                            <div className="flex flex-col gap-2 pt-3">
                              <label
                                htmlFor="observacoes"
                                className="text-sm font-semibold"
                              >
                                Observações
                              </label>
                              <Textarea
                                id="observacoes"
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Detalhes do serviço, peças a serem verificadas, etc."
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>

                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime}
                      className="w-full"
                    >
                      Confirmar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
