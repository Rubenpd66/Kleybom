import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

const PALABRA = "BORRAR";

export async function POST(request: NextRequest) {
  // Solo se acepta desde nuestra propia web (protección contra envíos desde otros sitios).
  const origen = request.headers.get("origin");
  if (origen && origen !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const usuario = await getCurrentUser();
  if (!usuario) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const datos = await request.formData();
  if (datos.get("confirmacion") !== PALABRA) {
    return NextResponse.json({ error: "Confirmación incorrecta" }, { status: 400 });
  }

  // Se borra el usuario autenticado, nunca un id recibido en la petición.
  const { error } = await createAdminClient().auth.admin.deleteUser(usuario.id);
  if (error) return NextResponse.json({ error: "No se pudo borrar la cuenta" }, { status: 500 });

  const supabase = await createServerClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/?cuenta=borrada", request.url), 303);
}
