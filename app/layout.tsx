import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberApp — Reserva tu turno",
  description: "Sistema de reservas con pagos online para barberías.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          min-h-screen
          bg-[#0D0D0D] 
          text-white
          flex flex-col
          pt-20
        `}
      >
        {/* NAVBAR GLOBAL */}
        <NavBar />

        {/* CONTENIDO */}
        <main className="flex-1 w-full px-4 md:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
