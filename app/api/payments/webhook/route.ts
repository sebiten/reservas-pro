import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supabase = await createClient();

        // Cuando Mercado Pago manda la notificación:
        const { type, data } = body;

        // Solo manejamos notificaciones de pagos
        if (type !== "payment") {
            return NextResponse.json({ status: "ignored" });
        }

        // 1. Buscar el pago real en Mercado Pago
        const paymentId = data.id;
        const mpRes = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                },
            }
        );
        const payment = await mpRes.json();

        const status = payment.status;
        const preferenceId = payment.order?.id; // ID de preferencia de pago

        // 2. Buscar el turno asociado
        const { data: appt } = await supabase
            .from("appointments")
            .select("*")
            .eq("mp_preference_id", preferenceId)
            .single();

        if (!appt) {
            console.log("⚠ Pago recibido pero turno no encontrado.");
            return NextResponse.json({ status: "no_appointment" });
        }

        // 3. Logica según estado del pago
        if (status === "approved") {
            await supabase
                .from("appointments")
                .update({
                    payment_status: "pagado",
                    status: "confirmado",
                    mp_payment_id: paymentId,
                })
                .eq("id", appt.id);

            console.log("✨ Turno pagado y confirmado.");
            return NextResponse.json({ status: "ok" });
        }

        if (status === "rejected") {
            await supabase
                .from("appointments")
                .update({
                    payment_status: "rechazado",
                    status: "cancelado",
                })
                .eq("id", appt.id);

            console.log("❌ Pago rechazado → turno cancelado.");
            return NextResponse.json({ status: "cancelled" });
        }

        if (status === "in_process" || status === "pending") {
            console.log("⌛ Pago todavía pendiente.");
            return NextResponse.json({ status: "pending" });
        }

        // TODO: manejar otros estados si querés
        console.log("⚠ Estado desconocido:", status);

        return NextResponse.json({ status: "ok" });
    } catch (e) {
        console.error("❌ Error Webhook MP:", e);
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
}
