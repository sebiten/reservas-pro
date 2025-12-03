// app/admin/appointments/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import AdminReserva from "./AdminReservas";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
    const supabase = await createClient();

    // 1) Usuario logueado
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }



    // 2) Check rol admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

   if (!profile || (profile.role !== "admin" && profile.role !== "barbero")) {
  redirect("/");
}




    // 3) Traer turnos con joins
 // ...existing code...
    // 3) Traer turnos con joins
    const { data: appointments, error } = await supabase
        .from("appointments")
        .select(
            `
      id,
      date,
      start_time,
      end_time,
      status,
      payment_status,
      total_amount,
      deposit_amount,
      barbers:barber_id (
        id,
        display_name,
        avatar_url
      ),
      customer:customer_id (
        id,
        full_name,
        phone
      ),
      service:service_id (
        id,
        name,
        duration_minutes,
        price
      )
    `
        )
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

    console.log("APPOINTMENTS:", appointments, "ERROR:", error);
    if (error) {
      // muestra el error en consola y lanza para que el flujo sea evidente
      throw new Error("Supabase query error: " + error.message);
    }
// ...existing code...
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-slate-400">
                            Panel de administración · Barbería
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Calendario de turnos
                        </h1>
                    </div>
                    <div className="rounded-full bg-slate-900/70 px-4 py-2 text-xs text-slate-300 shadow-inner">
                        Conectado como{" "}
                        <span className="font-semibold text-emerald-400">
                            {profile?.full_name}
                        </span>
                    </div>
                </header>

                <AdminReserva appointments={appointments ?? []} />
            </div>
        </div>
    );
}
