import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export async function POST(req: Request) {
    try {
        const { appointmentId, title, amount, payType } = await req.json();

        if (!appointmentId || !amount) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        const mp = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN!,
        });

        const preference = await new Preference(mp).create({
            body: {
                items: [
                    {
                        id: appointmentId,
                        title,
                        quantity: 1,
                        unit_price: amount,
                    },
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_URL}/reservar/success?appointment_id=${appointmentId}&pay=${payType}`,
                    failure: `${process.env.NEXT_PUBLIC_URL}/reservar/error`,
                    pending: `${process.env.NEXT_PUBLIC_URL}/reservar/pending`,
                },

                auto_return: "approved",
                metadata: {
                    appointmentId,
                    payType,
                },
            },
        });

        return NextResponse.json({ url: preference.init_point });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Error creando preferencia" },
            { status: 500 }
        );
    }
}
