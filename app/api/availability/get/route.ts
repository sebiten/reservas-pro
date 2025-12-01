import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { barberId, date, duration } = body;

        if (!barberId || !date) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1) Obtener turnos ocupados
        const { data: appointments } = await supabase
            .from("appointments")
            .select("start_time, end_time")
            .eq("barber_id", barberId)
            .eq("date", date);

        // 2) Definir horario laboral
        const opening = "09:00";
        const closing = "18:00";

        // Si no te mandan duración, usás 30 min
        const slotDuration = duration ?? 30;

        // 3) Generar todos los posibles horarios del día
        const slots: string[] = [];
        let current = new Date(`${date}T${opening}:00`);

        const end = new Date(`${date}T${closing}:00`);

        while (current < end) {
            const timeStr = current.toTimeString().slice(0, 5);
            slots.push(timeStr);

            current = new Date(current.getTime() + slotDuration * 60000);
        }

        // 4) Filtrar horarios ocupados
        const available = slots.filter((slot) => {
            return !appointments?.some((appt) => {
                // Comparamos texto HH:MM
                const apptStart = appt.start_time.slice(0, 5);
                return apptStart === slot;
            });
        });

        return NextResponse.json({
            date,
            available_slots: available,
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { error: "Error procesando la disponibilidad" },
            { status: 500 }
        );
    }
}
