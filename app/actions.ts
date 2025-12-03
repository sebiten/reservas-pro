"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient as createPublicClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export async function signOutAction() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    redirect('/auth/login')
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  revalidatePath("/admin/usuarios");

  return true;
}