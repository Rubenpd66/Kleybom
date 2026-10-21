import { createServerClient as crear } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const almacen = await cookies();
  return crear(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) =>
              almacen.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: no se pueden escribir cookies.
          }
        },
      },
    },
  );
}
