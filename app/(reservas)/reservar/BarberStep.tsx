"use client";

import { useEffect, useState } from "react";
import { Barber } from "@/types/barbershop";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
    onSelect: (barber: Barber) => void;
};

export default function BarberStep({ onSelect }: Props) {
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("barbers")
                .select("*")
                .eq("is_active", true)
                .order("display_name");

            setBarbers(data ?? []);
            setLoading(false);
        };

        load();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center mt-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto mt-16 px-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">
                Seleccioná tu barbero
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {barbers.map((b) => (
                    <motion.div
                        key={b.id}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 180, damping: 14 }}
                    >
                        <Card
                            className={cn(
                                "cursor-pointer rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-md hover:border-blue-500/40 hover:shadow-blue-500/10 transition-all"
                            )}
                            onClick={() => {
                                console.log("Barbero seleccionado:", b);
                                onSelect(b);
                            }}
                        >
                            <CardContent className="p-4 flex items-center gap-4">

                                {/* AVATAR */}
                                {b.avatar_url ? (
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500">
                                        <Image
                                            src="/vercel.svg"
                                            alt={b.display_name}
                                            width={56}
                                            height={56}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center text-white/70 font-bold text-xl">
                                        {b.display_name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* TEXT */}
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-lg text-white">
                                        {b.display_name}
                                    </h3>
                                    {b.bio && (
                                        <p className="text-sm text-zinc-400 leading-snug">
                                            {b.bio}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
