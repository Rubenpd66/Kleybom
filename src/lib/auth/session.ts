import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
