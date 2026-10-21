import { createClient } from "@supabase/supabase-js";

// Solo para código de servidor. La clave de servicio da acceso total: nunca en el navegador
// ni con prefijo NEXT_PUBLIC_.
export function createAdminClient() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
