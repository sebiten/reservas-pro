"use client"

import { useMemo, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Clock, Scissors, Filter, TrendingUp, DollarSign, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type AdminAppointment = {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
  total_amount: number
  deposit_amount: number | null
  barbers:
    | {
        id: string
        display_name: string
        avatar_url: string | null
      }[]
    | null
  customer:
    | {
        id: string
        full_name: string | null
        phone: string | null
      }[]
    | null
  service:
    | {
        id: string
        name: string
        duration_minutes: number
        price: number
      }[]
    | null
}

type Props = {
  appointments: AdminAppointment[]
}

// Hook para detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768)
    checkSize()
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  return isMobile
}

// Configuración de estados
const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  confirmado: {
    label: "Confirmado",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
}

function getPaymentInfo(a: AdminAppointment) {
  const total = Number(a.total_amount)
  const deposit = a.deposit_amount ? Number(a.deposit_amount) : 0
  const remaining = total - deposit

const status = a.payment_status;

// 1. TOTAL PAGADO
if (status === "total_pagado") {
  return {
    label: "Pagado",
    detail: `$${total.toFixed(0)}`,
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: "✓",
  }
}

// 2. SEÑA PAGADA (Pago Parcial)
if (status === "seña_pagada") {
  return {
    label: "Seña Pagada",
    detail: `$${deposit} de $${total}`,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    icon: "◐",
    remaining: `Falta: $${remaining.toFixed(0)}`,
  }
}

// 3. SEÑA PENDIENTE
if (status === "seña_pendiente") {
  return {
    label: "Seña Pendiente",
    detail: `Pagar $${deposit} de $${total}`,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: "△",
  }
}

// 4. REEMBOLSADO
if (status === "reembolsado") {
  return {
    label: "Reembolsado",
    detail: `$${total.toFixed(0)}`,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    icon: "↺",
  }
}

// 5. SIN PAGO (Comportamiento por defecto, cubre "sin_pago")
// Esto también podría ser un 'else' al final.
return {
  label: "Sin Pago",
  detail: `$${total.toFixed(0)}`,
  className: "bg-muted text-muted-foreground border-border",
  icon: "○",
}
}

// Funciones para el calendario
function getMonthLabel(date: Date) {
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
}

function getDaysMatrix(currentMonth: Date) {
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startWeekDay = (firstDayOfMonth.getDay() + 6) % 7 // lunes=0
  const daysInMonth = lastDayOfMonth.getDate()

  const days: (Date | null)[] = []
  for (let i = 0; i < startWeekDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return weeks
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function AdminReserva({ appointments }: Props) {
  const isMobile = useIsMobile()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedBarber, setSelectedBarber] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Opciones de barberos
  const barbersOptions = useMemo(() => {
    const map = new Map<string, string>()
    appointments.forEach((a) => {
      const barber = a.barbers?.[0]
      if (barber) map.set(barber.id, barber.display_name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [appointments])

  // Filtros aplicados
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (selectedBarber !== "all" && a.barbers?.[0]?.id !== selectedBarber) return false
      if (selectedStatus !== "all" && a.status !== selectedStatus) return false
      return true
    })
  }, [appointments, selectedBarber, selectedStatus])

  // Turnos agrupados por fecha
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>()
    filteredAppointments.forEach((a) => {
      if (!map.has(a.date)) map.set(a.date, [])
      map.get(a.date)!.push(a)
    })
    for (const list of map.values()) {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time))
    }
    return map
  }, [filteredAppointments])

  const weeks = useMemo(() => getDaysMatrix(currentMonth), [currentMonth])

  const hasActiveFilters = selectedBarber !== "all" || selectedStatus !== "all"

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredAppointments.length
    const confirmados = filteredAppointments.filter((a) => a.status === "confirmado").length
    const totalRevenue = filteredAppointments
      .filter((a) => a.payment_status === "pagado")
      .reduce((sum, a) => sum + Number(a.total_amount), 0)

    return { total, confirmados, totalRevenue }
  }, [filteredAppointments])

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // ============================================================
  // 📱 MOBILE VIEW
  // ============================================================
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-border/40 bg-card">
            <CardContent className="p-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <p className="text-xl font-semibold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card">
            <CardContent className="p-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-[10px] text-muted-foreground">Confirm.</p>
                </div>
                <p className="text-xl font-semibold text-foreground">{stats.confirmados}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card">
            <CardContent className="p-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-accent" />
                  <p className="text-[10px] text-muted-foreground">Ingresos</p>
                </div>
                <p className="text-base font-semibold text-foreground">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="border-border/40 bg-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-foreground">Turnos</CardTitle>
                  <p className="text-xs text-muted-foreground">Lista de reservas</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 w-full border-border bg-secondary text-foreground"
            >
              <Filter className="mr-2 h-3 w-3" />
              Filtros
              {hasActiveFilters && <Badge className="ml-2 h-4 w-4 rounded-full bg-primary p-0 text-[10px]">!</Badge>}
            </Button>

            {showFilters && (
              <div className="mt-3 flex flex-col gap-2">
                <Select value={selectedBarber} onValueChange={(v) => setSelectedBarber(v)}>
                  <SelectTrigger className="h-9 border-border bg-secondary text-xs">
                    <SelectValue placeholder="Todos los barberos" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover text-xs">
                    <SelectItem value="all">Todos los barberos</SelectItem>
                    {barbersOptions.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
                  <SelectTrigger className="h-9 border-border bg-secondary text-xs">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover text-xs">
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBarber("all")
                      setSelectedStatus("all")
                    }}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-3">
            {filteredAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-center text-sm text-muted-foreground">No hay turnos para mostrar</p>
              </div>
            )}

            <div className="flex flex-col divide-y divide-border/40">
              {filteredAppointments.map((a) => {
                const paymentInfo = getPaymentInfo(a)
                const dateObj = new Date(a.date + "T00:00:00")
                const dateLabel = dateObj.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })

                return (
                  <div key={a.id} className="py-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <span className="text-lg font-semibold text-foreground">{a.start_time.slice(0, 5)}</span>
                        <p className="text-xs capitalize text-muted-foreground">{dateLabel}</p>
                      </div>
                      <Badge className={cn("text-[10px]", statusConfig[a.status].className)}>
                        {statusConfig[a.status].label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={a.barbers?.[0]?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {a.barbers?.[0]?.display_name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {a.customer?.[0]?.full_name ?? "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.service?.[0]?.name} • {a.barbers?.[0]?.display_name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={cn("text-[10px]", paymentInfo.className)}>
                        {paymentInfo.icon} {paymentInfo.label}: {paymentInfo.detail}
                      </Badge>
                      {paymentInfo.remaining && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">{paymentInfo.remaining}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================
  // 🖥 DESKTOP VIEW
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/40 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de turnos</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.confirmados}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos totales</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  ${(stats.totalRevenue / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card className="border-border/40 bg-card shadow-sm">
        <CardHeader className="border-b border-border/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Calendario de turnos</CardTitle>
                <p className="text-sm text-muted-foreground">Vista mensual completa</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filtros */}
              <Select value={selectedBarber} onValueChange={(v) => setSelectedBarber(v)}>
                <SelectTrigger className="w-[180px] border-border bg-secondary">
                  <Scissors className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Barbero" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">Todos los barberos</SelectItem>
                  {barbersOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
                <SelectTrigger className="w-[160px] border-border bg-secondary">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBarber("all")
                    setSelectedStatus("all")
                  }}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              )}

              {/* Navegación de mes */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newMonth = new Date(currentMonth)
                    newMonth.setMonth(newMonth.getMonth() - 1)
                    setCurrentMonth(newMonth)
                  }}
                  className="border-border bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[160px] text-center text-sm font-medium capitalize text-foreground">
                  {getMonthLabel(currentMonth)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newMonth = new Date(currentMonth)
                    newMonth.setMonth(newMonth.getMonth() + 1)
                    setCurrentMonth(newMonth)
                  }}
                  className="border-border bg-secondary"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div className="space-y-2">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div key={`empty-${dayIdx}`} className="aspect-square min-h-[100px] rounded-lg bg-muted/30" />
                      )
                    }

                    const dateKey = formatDateKey(day)
                    const dayAppointments = appointmentsByDate.get(dateKey) || []
                    const hasAppointments = dayAppointments.length > 0

                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "aspect-square min-h-[100px] rounded-lg border p-2 transition-all hover:shadow-sm",
                          isToday(day) ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
                          !isCurrentMonth(day) && "opacity-40",
                        )}
                      >
                        <div className="flex h-full flex-col">
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={cn("text-sm font-medium", isToday(day) ? "text-primary" : "text-foreground")}
                            >
                              {day.getDate()}
                            </span>
                            {hasAppointments && (
                              <Badge
                                variant="secondary"
                                className="h-5 w-5 rounded-full bg-primary/10 p-0 text-[10px] text-primary"
                              >
                                {dayAppointments.length}
                              </Badge>
                            )}
                          </div>

                          <div className="flex-1 space-y-1 overflow-y-auto">
                            {dayAppointments.slice(0, 3).map((apt) => {
                              const paymentInfo = getPaymentInfo(apt)
                              return (
                                <div
                                  key={apt.id}
                                  className={cn(
                                    "rounded border-l-2 bg-secondary/50 px-1.5 py-1 text-[10px] leading-tight",
                                    apt.status === "confirmado" && "border-l-emerald-500",
                                    apt.status === "pendiente" && "border-l-amber-500",
                                    apt.status === "cancelado" && "border-l-rose-500",
                                  )}
                                >
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                    <span className="font-medium text-foreground">{apt.start_time.slice(0, 5)}</span>
                                  </div>
                                  <p className="truncate text-muted-foreground">
                                    {apt.customer?.[0]?.full_name ?? "Sin nombre"}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={cn(
                                        "text-[9px]",
                                        paymentInfo.className.includes("emerald") && "text-emerald-600",
                                        paymentInfo.className.includes("sky") && "text-sky-600",
                                        paymentInfo.className.includes("muted") && "text-muted-foreground",
                                      )}
                                    >
                                      {paymentInfo.icon}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground">{paymentInfo.detail}</span>
                                  </div>
                                </div>
                              )
                            })}
                            {dayAppointments.length > 3 && (
                              <div className="px-1.5 py-0.5 text-center text-[9px] text-muted-foreground">
                                +{dayAppointments.length - 3} más
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
