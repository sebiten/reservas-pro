"use client";

import { useState } from "react";
import { Barber, Service } from "@/types/barbershop";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    barber: Barber;
    service: Service;
    date: string;
    time: string;
};

export default function ConfirmStep({ barber, service, date, time }: Props) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const createPayment = async (payType: "deposit" | "full") => {
        try {
            setLoading(true);

            // 1) Obtener usuario
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // 2) Crear turno
            const res = await fetch("/api/appointments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: user?.id,
                    barberId: barber.id,
                    serviceId: service.id,
                    date,
                    start_time: time,
                    price: service.price,
                    deposit: service.deposit_min,
                    duration: service.duration_minutes,
                }),
            });

            const result = await res.json();
            if (!result.appointment) {
                setLoading(false);
                return alert("Error al crear el turno.");
            }

            const appointmentId = result.appointment.id;

            // 3) Crear preferencia MP
            const mpRes = await fetch("/api/payments/create-preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointmentId,
                    title: service.name,
                    amount: payType === "deposit" ? service.deposit_min : service.price,
                    payType, // "deposit" ó "full"
                }),
            });

            const mpData = await mpRes.json();

            setLoading(false);

            if (mpData.url) {
                window.location.href = mpData.url; // Checkout Pro
            } else {
                alert("Error creando preferencia.");
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
            alert("Error inesperado.");
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 mt-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold">
                        Confirmar tu reserva
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Barbero:</p>
                        <p>{barber.display_name}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Servicio:</p>
                        <p>{service.name}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Fecha:</p>
                        <p>{date}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Hora:</p>
                        <p>{time}</p>
                    </div>

                    <div className="flex justify-between pt-2">
                        <p className="text-muted-foreground">Precio total:</p>
                        <p className="font-semibold">${service.price}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Seña obligatoria:</p>
                        <p className="font-semibold text-blue-500">${service.deposit_min}</p>
                    </div>
                </CardContent>
            </Card>

            {/* BOTÓN — pagar solo seña (obligatorio) */}
            <Button
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => createPayment("deposit")}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Pagar SEÑA (obligatoria)"}
            </Button>

            {/* BOTÓN — pagar servicio completo (opcional) */}
            <Button
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                onClick={() => createPayment("full")}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Pagar TODO el servicio"}
            </Button>
        </div>
    );
}
