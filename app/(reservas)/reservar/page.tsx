"use client";

import { useState } from "react";
import BarberStep from "./BarberStep";
import ServiceStep from "./ServiceStep";
import DateStep from "./DateStep";
import ConfirmStep from "./ConfirmStep";

import type { Barber, Service } from "@/types/barbershop";

export default function ReservarPage() {
    const [step, setStep] = useState<number>(1);

    const [barber, setBarber] = useState<Barber | null>(null);
    const [service, setService] = useState<Service | null>(null);

    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");

    return (
        <div className="p-6 max-w-2xl mx-auto">

            {/* STEP 1 */}
            {step === 1 && (
                <BarberStep
                    onSelect={(b: Barber) => {
                        setBarber(b);
                        setStep(2);
                    }}
                />
            )}

            {/* STEP 2 */}
            {step === 2 && barber && (
                <ServiceStep
                    onSelect={(s: Service) => {
                        setService(s);
                        setStep(3);
                    }}
                />
            )}

            {/* STEP 3 */}
            {step === 3 && barber && (
                <DateStep
                    barberId={barber.id}
                    onSelect={(d, t) => {
                        console.log("Fecha/hora seleccionada:", d, t); // 👈 agregá esto
                        setDate(d);
                        setTime(t);
                        setStep(4);
                    }}
                />
            )}

            {/* STEP 4 */}
            {step === 4 && barber && service && (
                <ConfirmStep

                    barber={barber}
                    service={service}
                    date={date}
                    time={time}
                />
            )}
        </div>
    );
}
