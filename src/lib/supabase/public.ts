import { createClient } from "@supabase/supabase-js";

// Cliente sin cookies ni sesión: ve solo lo que ve un visitante anónimo.
// Sirve para datos públicos que se guardan en caché (portada, sitemap).
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
