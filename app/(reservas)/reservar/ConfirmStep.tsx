"use client"

import { useState } from "react"
import type { Barber, Service } from "@/types/barbershop"
import { Loader2, Calendar, Clock, User, Scissors, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type Props = {
    barber: Barber
    service: Service
    date: string
    time: string
}

type PaymentType = "deposit" | "full"

export default function ConfirmStep({ barber, service, date, time }: Props) {
    const [loadingType, setLoadingType] = useState<PaymentType | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
        }).format(price)
    }

    const createPayment = async (payType: PaymentType) => {
        setError(null)
        setLoadingType(payType)

        try {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser()

            if (authError || !user) {
                throw new Error("Debes iniciar sesión para reservar un turno")
            }

            const appointmentRes = await fetch("/api/appointments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: user.id,
                    barberId: barber.id,
                    serviceId: service.id,
                    date,
                    start_time: time,
                    price: service.price,
                    deposit: service.deposit_min,
                    duration: service.duration_minutes,
                }),
            })

            if (!appointmentRes.ok) {
                const errorData = await appointmentRes.json()
                throw new Error(errorData.message || "Error al crear el turno")
            }

            const { appointment } = await appointmentRes.json()

            if (!appointment?.id) {
                throw new Error("No se pudo crear el turno")
            }

            const amount = payType === "deposit" ? service.deposit_min : service.price
            const mpRes = await fetch("/api/payments/create-preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointmentId: appointment.id,
                    title: `${service.name} - ${barber.display_name}`,
                    amount,
                    payType,
                }),
            })

            if (!mpRes.ok) {
                throw new Error("Error al generar el pago")
            }

            const { url } = await mpRes.json()

            if (!url) {
                throw new Error("No se recibió la URL de pago")
            }

            window.location.href = url
        } catch (err) {
            console.error("Error en createPayment:", err)
            setError(err instanceof Error ? err.message : "Ocurrió un error inesperado")
            setLoadingType(null)
        }
    }

    const depositPercentage = Math.round((service.deposit_min / service.price) * 100)
    const remainingAmount = service.price - service.deposit_min

    return (
        <div className="min-h-screen bg-zinc-900 md:bg-gradient-to-br md:from-zinc-950 md:via-zinc-900 md:to-zinc-800 md:py-2 px-3 py-4 md:px-4">
            <div className="max-w-xl mx-auto space-y-4 md:space-y-6">
                <div className="text-center space-y-2 md:space-y-3 pt-2 md:pt-4">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Casi listo
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-balance text-white">Confirmar Reserva</h1>
                    <p className="text-sm md:text-base text-zinc-400 text-pretty px-2">
                        Revisa los detalles antes de continuar con el pago
                    </p>
                </div>

                <Card className="shadow-md md:shadow-xl  border-zinc-800 overflow-hidden bg-zinc-900">
                    <CardHeader className="">
                        <CardTitle className="flex items-center gap-2 text-base md:text-xl text-white mt-4">
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                            Detalles de tu reserva
                        </CardTitle>
                        <p className="text-xs md:text-sm text-zinc-400 mt-1">Verifica que toda la información sea correcta</p>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-zinc-500">Barbero</p>
                                <p className="text-base md:text-lg font-semibold truncate text-white">{barber.display_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                <Scissors className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-zinc-500">Servicio</p>
                                <p className="text-base md:text-lg font-semibold truncate text-white">{service.name}</p>
                                <p className="text-xs md:text-sm text-zinc-500">Duración: {service.duration_minutes} min</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-zinc-500">Fecha</p>
                                <p className="text-base md:text-lg font-semibold capitalize truncate text-white">{formatDate(date)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <Clock className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-zinc-500">Hora</p>
                                <p className="text-base md:text-lg font-semibold text-white">{time}</p>
                            </div>
                        </div>

                        {/* <Separator className="my-2 bg-zinc-800" /> */}

                        <div className="space-y-3 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 md:p-4">
                            <div className="flex justify-between items-baseline gap-2">
                                <span className="text-xs md:text-sm text-zinc-400">Precio total del servicio</span>
                                <span className="text-xl md:text-2xl font-bold text-white">{formatPrice(service.price)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-500/20 border border-blue-500/30 -mx-3 md:-mx-4 px-3 md:px-4 py-2.5 md:py-3 rounded-lg">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs md:text-sm font-semibold text-blue-400">Seña obligatoria</span>
                                    <Badge variant="secondary" className="text-xs bg-zinc-700 text-zinc-200 border-zinc-600">
                                        {depositPercentage}%
                                    </Badge>
                                </div>
                                <span className="text-lg md:text-xl font-bold text-blue-400">{formatPrice(service.deposit_min)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs md:text-sm gap-2">
                                <span className="text-zinc-400">Resto a pagar en el local</span>
                                <span className="font-medium text-zinc-300">{formatPrice(remainingAmount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive" className="animate-in slide-in-from-top-2 border-2 mx-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                )}

                <Card className=" border-zinc-800 bg-zinc-900 shadow-sm md:shadow-lg">
                    <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                        <h3 className="font-bold text-base md:text-xl flex items-center gap-2 text-white">💳 Opciones de pago</h3>

                        <div className="space-y-3 md:space-y-4">
                            <div className="flex gap-2.5 md:gap-3 items-start">
                                <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-[#009ee3] text-white flex items-center justify-center shrink-0 text-xs md:text-sm font-bold mt-0.5">
                                    1
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-start md:items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-sm md:text-base text-white">Pagar solo la seña</p>
                                        <Badge className="bg-[#009ee3] text-white text-xs hover:bg-[#0083c1]">Recomendado</Badge>
                                    </div>
                                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                                        Asegura tu turno con {formatPrice(service.deposit_min)} y paga el resto en la barbería
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2.5 md:gap-3 items-start">
                                <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-zinc-700 text-white flex items-center justify-center shrink-0 text-xs md:text-sm font-bold mt-0.5">
                                    2
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold text-sm md:text-base text-white">Pagar el servicio completo</p>
                                    <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                                        Paga todo ahora y olvídate de llevar efectivo al turno
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-3 pb-6">
                    <button
                        className="w-full h-14 md:h-16 rounded-md md:rounded-lg font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#009ee3] hover:bg-[#0083c1] text-white active:scale-[0.98] flex items-center justify-center gap-2"
                        onClick={() => createPayment("deposit")}
                        disabled={loadingType !== null}
                    >
                        {loadingType === "deposit" ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <span>Pagar Seña</span>
                                <span className="font-black">•</span>
                                <span>{formatPrice(service.deposit_min)}</span>
                            </>
                        )}
                    </button>

                    <button
                        className="w-full h-12 md:h-14 rounded-md md:rounded-lg font-semibold text-sm md:text-base border-2 border-[#009ee3] text-[#009ee3] hover:bg-[#009ee3]/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                        onClick={() => createPayment("full")}
                        disabled={loadingType !== null}
                    >
                        {loadingType === "full" ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <span>Pagar Servicio Completo</span>
                                <span className="font-black">•</span>
                                <span>{formatPrice(service.price)}</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-zinc-500 pb-4 px-2">
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" />
                    <span className="text-center">Pago seguro procesado por Mercado Pago</span>
                </div>
            </div>
        </div>
    )
}
