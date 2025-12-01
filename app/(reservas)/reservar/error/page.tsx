"use client";

import { XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
    return (
        <motion.div
            className="max-w-xl mx-auto mt-24 px-4 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <XCircle className="h-16 w-16 mx-auto text-red-500 drop-shadow-lg mb-6" />

            <h1 className="text-3xl font-bold mb-3">Pago rechazado</h1>
            <p className="text-zinc-400 mb-8">
                El pago no pudo completarse.
                Podés intentarlo nuevamente o elegir otro método.
            </p>

            <Link href="/reservar">
                <Button className="w-full h-12 text-lg rounded-xl bg-red-600 hover:bg-red-700">
                    Intentar nuevamente
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
