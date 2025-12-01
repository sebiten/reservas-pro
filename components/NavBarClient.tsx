"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBarClient({
    loggedIn,
    role,
}: {
    loggedIn: boolean;
    role: string | null;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Toggle Button */}
            <button
                className="md:hidden text-white"
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="
              absolute top-full left-0 w-full
              bg-black/90 backdrop-blur-xl
              border-b border-zinc-800
              md:hidden px-6 py-6
              space-y-5 text-white shadow-lg
            "
                    >
                        <Link href="/" onClick={() => setOpen(false)} className="block hover:text-blue-400">
                            Inicio
                        </Link>

                        <Link href="/reservar" onClick={() => setOpen(false)} className="block hover:text-blue-400">
                            Reservar
                        </Link>

                        {role === "admin" && (
                            <Link href="/admin" onClick={() => setOpen(false)} className="block hover:text-blue-400">
                                Panel Admin
                            </Link>
                        )}

                        {!loggedIn ? (
                            <Link href="/auth/login" onClick={() => setOpen(false)}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-5 text-lg">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/mi-cuenta" onClick={() => setOpen(false)} className="block hover:text-blue-400">
                                    Mi Cuenta
                                </Link>

                                <LogoutButton />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
