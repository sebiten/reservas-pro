import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import UsersAdminClient from "./UserAdminClient";

export default async function UsersAdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log("AUTH USER:", user);

  if (!user) redirect("/");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("PROFILE:", profile);
  console.log("PROFILE ERROR:", profileErr);

  // PROTECCIÓN SEGURA
  if (!profile || profile.role !== "admin" || profile.role === "") {
    console.log("NO ES ADMIN → redirect");
    redirect("/");
  }

 const { data: users } = await supabase
  .from("profiles")
  .select("id, full_name, phone, role, created_at")
  .order("created_at", { ascending: false })
  .limit(10);

  return (
  <UsersAdminClient
    initialUsers={users || []}
    currentUserId={user.id} // 🔥 acá
  />
);
;
}
