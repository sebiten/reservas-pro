"use client";

import { useEffect, useState } from "react";
import { Service } from "@/types/barbershop";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
    onSelect: (service: Service) => void;
    barberId?: string;
};

export default function ServiceStep({ onSelect }: Props) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("services")
                .select("*")
                .eq("is_active", true)
                .order("price");

            setServices(data ?? []);
            setLoading(false);
        };

        load();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center mt-16">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto mt-16 px-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">
                Seleccioná un servicio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {services.map((s) => (
                    <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 180, damping: 14 }}
                    >
                        <Card
                            className={cn(
                                "cursor-pointer rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-md",
                                "hover:border-blue-500/40 hover:shadow-blue-500/10 transition-all"
                            )}
                            onClick={() => onSelect(s)}
                        >
                            <CardContent className="p-5 space-y-3">

                                <div className="flex justify-between items-start">

                                    {/* INFO IZQUIERDA */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-xl text-white leading-tight">
                                            {s.name}
                                        </h3>

                                        {s.description && (
                                            <p className="text-sm text-zinc-400 leading-snug mt-1">
                                                {s.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* PRECIO Y DURACIÓN */}
                                    <div className="text-right">
                                        <p className="font-bold text-blue-400 text-lg">${s.price}</p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {s.duration_minutes} min
                                        </p>
                                    </div>

                                </div>

                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
