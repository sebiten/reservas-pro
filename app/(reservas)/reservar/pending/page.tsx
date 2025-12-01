"use client";

import { Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PendingPage() {
    return (
        <motion.div
            className="max-w-xl mx-auto mt-24 px-4 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Clock className="h-16 w-16 mx-auto text-yellow-400 drop-shadow-lg mb-6" />

            <h1 className="text-3xl font-bold mb-3">Pago en revisión</h1>
            <p className="text-zinc-400 mb-8">
                Tu pago está siendo revisado por la entidad bancaria.
                Te notificaremos cuando sea aprobado.
            </p>

            <div className="flex justify-center mb-10">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
            </div>

            <Link href="/mi-cuenta">
                <Button className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700">
                    Ver mis turnos
                </Button>
            </Link>

            <Link href="/" className="block mt-4">
                <Button
                    variant="outline"
                    className="w-full h-12 text-lg rounded-xl border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                >
                    Volver al inicio
                </Button>
            </Link>
        </motion.div>
    );
}
