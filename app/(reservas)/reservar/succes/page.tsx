"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Calendar, Clock, User2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SuccessPage() {
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<any>(null);
    const [payType, setPayType] = useState<"deposit" | "full" | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const appointmentId = searchParams.get("appointment_id");
                const pay = searchParams.get("pay");

                if (!appointmentId) return;

                setPayType(pay === "full" ? "full" : "deposit");

                const { data } = await supabase
                    .from("appointments")
                    .select(
                        `*, 
            services(name, duration_minutes, price, deposit_min),
            barbers(display_name)`
                    )
                    .eq("id", appointmentId)
                    .maybeSingle();

                setAppointment(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading)
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
        );

    if (!appointment)
        return (
            <div className="text-center mt-20 text-white">
                <p>No se encontró la información del turno.</p>
                <Link href="/">
                    <Button className="mt-4">Volver al inicio</Button>
                </Link>
            </div>
        );

    return (
        <motion.div
            className="max-w-xl mx-auto mt-20 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* ICONO GRANDE */}
            <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 drop-shadow-lg" />
            </div>

            <h1 className="text-center text-3xl font-bold text-white mb-4">
                ¡Tu turno está reservado!
            </h1>

            <p className="text-center text-zinc-400 mb-8">
                Pago {payType === "full" ? "completo" : "de seña"} confirmado ✔
            </p>

            <Card className="bg-neutral-900 border border-neutral-700 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-white">
                        Detalles del turno
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-sm text-zinc-300">
                    <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <User2 size={18} /> Barbero
                        </span>
                        <span>{appointment.barbers.display_name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-zinc-400">
                            ✂️ Servicio
                        </span>
                        <span>{appointment.services.name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <Calendar size={18} /> Fecha
                        </span>
                        <span>{appointment.date}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <Clock size={18} /> Hora
                        </span>
                        <span>{appointment.start_time}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-neutral-700">
                        <span className="text-zinc-400">Monto pagado</span>
                        <span className="font-semibold text-green-400">
                            $
                            {payType === "full"
                                ? appointment.services.price
                                : appointment.services.deposit_min}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* BOTONES */}
            <div className="mt-10 flex flex-col gap-3">
                <Link href="/mi-cuenta">
                    <Button
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                        Ver mis turnos
                    </Button>
                </Link>

                <Link href="/">
                    <Button
                        variant="outline"
                        className="w-full h-12 text-lg rounded-xl border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                    >
                        Volver al inicio
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
