import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/server";
import NavBarClient from "./NavBarClient";
import { signOutAction } from "@/app/actions";

export default async function NavBar() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    const user = data.user;
    const email = user?.email;
    const name = email?.split("@")[0] ?? "Usuario";
    const role = user?.user_metadata?.role ?? null;

    const loggedIn = !!user;

    return (
        <nav className="
      w-full fixed top-0 left-0 z-50
      bg-black/60 backdrop-blur-xl
      border-b border-zinc-800
      shadow-[0_4px_20px_rgba(0,0,0,0.35)]
    ">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

                {/* LOGO */}
                <Link
                    href="/"
                    className="text-white font-bold text-2xl tracking-tight hover:text-blue-400 transition"
                >
                    BarberApp
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden md:flex items-center gap-8 text-white text-sm font-medium">

                    <Link href="/" className="hover:text-blue-400 transition">Inicio</Link>

                    <Link href="/reservar" className="hover:text-blue-400 transition">Reservar</Link>

                    {role === "admin" && (
                        <Link href="/admin" className="hover:text-blue-400 transition">
                            Panel Admin
                        </Link>
                    )}

                    {loggedIn ? (
                        <>
                            <Link href="/mi-cuenta" className="hover:text-blue-400 transition">
                                Mi Cuenta
                            </Link>

                            <form action={signOutAction}>
                                <Button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 rounded-xl px-4"
                                >
                                    Cerrar Sesión
                                </Button>
                            </form>

                            <span className="text-neutral-400 text-xs">{name}</span>
                        </>
                    ) : (
                        <Link href="/auth/login">
                            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5">
                                Iniciar Sesión
                            </Button>
                        </Link>
                    )}
                </div>

                {/* MOBILE MENU TOGGLE */}
                <NavBarClient loggedIn={loggedIn} role={role} />
            </div>
        </nav>
    );
}
