"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AvailableSlot } from "@/types/barbershop";
import { motion } from "framer-motion";

type Props = {
    barberId: string;
    onSelect: (date: string, time: string) => void;
};

export default function DateStep({ barberId, onSelect }: Props) {
    const [date, setDate] = React.useState<Date | undefined>();
    const [slots, setSlots] = React.useState<AvailableSlot[]>([]);
    const [loading, setLoading] = React.useState(false);

    const loadSlots = async (dateValue: Date) => {
        setLoading(true);

        const iso = dateValue.toISOString().split("T")[0];

        const res = await fetch("/api/availability/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barberId, date: iso }),
        });

        const data = await res.json();
        setSlots(data.available_slots || []);
        setLoading(false);
    };

    const handleDateSelect = (d: Date | undefined) => {
        setDate(d);
        if (d) loadSlots(d);
    };

    return (
        <div className="max-w-2xl mx-auto mt-16 px-4 space-y-8">

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-white text-center tracking-tight">
                Seleccioná una fecha
            </h2>

            {/* DATE PICKER */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-5 px-4",
                            "hover:border-blue-500/40 hover:bg-white/10 transition-all",
                            !date && "text-neutral-400"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {date ? format(date, "PPP", { locale: es }) : "Seleccioná una fecha"}
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0 border border-white/10 bg-black/90 backdrop-blur-xl rounded-xl text-white"
                    align="center"
                >
                    <Calendar
                        mode="single"
                        locale={es}
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className="rounded-xl"
                    />
                </PopoverContent>
            </Popover>

            {/* LOADING */}
            {loading && (
                <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin h-7 w-7 text-blue-400" />
                </div>
            )}

            {/* TIME SLOTS */}
            {!loading && date && slots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {slots.map((slot, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 180, damping: 12 }}
                        >
                            <Button
                                variant="secondary"
                                className="w-full h-12 text-base rounded-xl bg-white/10 text-white border border-white/10 shadow-sm hover:bg-blue-600 hover:border-blue-500/40 hover:shadow-blue-500/20 transition-all"
                                onClick={() =>
                                    onSelect(date.toISOString().split("T")[0], slot)
                                }
                            >
                                {slot}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && date && slots.length === 0 && (
                <p className="text-center text-zinc-400 py-4">
                    No hay horarios disponibles para esta fecha.
                </p>
            )}
        </div>
    );
}
