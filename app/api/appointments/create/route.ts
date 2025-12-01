import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            customerId,
            barberId,
            serviceId,
            date,
            start_time,
        } = body;

        if (!customerId || !barberId || !serviceId || !date || !start_time) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Obtener el servicio
        const { data: service } = await supabase
            .from("services")
            .select("duration_minutes, price, deposit_min")
            .eq("id", serviceId)
            .single();

        if (!service) {
            return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
        }

        // Calcular end_time
        const [h, m] = start_time.split(":").map(Number);
        const endDate = new Date(`1970-01-01T${start_time}:00`);
        endDate.setMinutes(endDate.getMinutes() + service.duration_minutes);

        const end_time = endDate.toTimeString().split(":").slice(0, 2).join(":");

        // 🔥 VALIDAR OVERBOOKING
        const { data: existing } = await supabase
            .from("appointments")
            .select("*")
            .eq("barber_id", barberId)
            .eq("date", date)
            .lte("start_time", end_time)
            .gte("end_time", start_time)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { error: "El horario ya está reservado" },
                { status: 409 }
            );
        }

        // Crear turno
        const { data: appt, error } = await supabase
            .from("appointments")
            .insert({
                customer_id: customerId,
                barber_id: barberId,
                service_id: serviceId,
                date,
                start_time,
                end_time,
                total_amount: service.price,
                deposit_amount: service.deposit_min,
                status: "pendiente",
                payment_status: "sin_pago",
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ appointment: appt });

    } catch (e) {
        console.error("Error al crear turno:", e);
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}
