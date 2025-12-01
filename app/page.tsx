"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-blue-950 flex items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        {/* <Image
          src="/barber-bg.jpg"
          alt="Barbershop"
          fill
          className="object-cover opacity-40"
          priority
        /> */}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/90 backdrop-blur-[2px]" />
      </div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl px-6 text-center"
      >

        {/* LOGO (opcional) */}
        {/* 
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex justify-center"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={140}
            className="drop-shadow-2xl"
          />
        </motion.div>
        */}

        {/* TITLE */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]">
          Reservá tu turno
          <br />
          <span className="text-blue-500">rápido, fácil y seguro</span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-6 text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Elegí tu barbero, servicio, fecha y horario. Pagá la seña online y asegurá tu lugar al instante.
        </p>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex justify-center"
        >
          <Button
            asChild
            size="lg"
            className="px-10 py-6 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all"
          >
            <Link href="/reservar">Reservar ahora</Link>
          </Button>
        </motion.div>

        {/* ADMIN LINK */}
        <div className="mt-10 text-sm text-zinc-400">
          <Link
            href="/admin/calendar"
            className="hover:text-zinc-200 transition underline underline-offset-4"
          >
            Acceso administrador
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
