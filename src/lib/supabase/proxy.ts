import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Solo la zona de cuenta exige sesión. El resto (calendario, diario, entreno, estadísticas, medidas,
// crear rutina) se puede ver sin cuenta y pide entrar solo al guardar.
const RUTAS_PRIVADAS = ["/panel"];
const RUTAS_ABIERTAS = ["/panel/medidas"];

export async function updateSession(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(lista, headers) {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
          Object.entries(headers).forEach(([k, v]) => respuesta.headers.set(k, v));
        },
      },
    },
  );

  // No poner código entre createServerClient y getClaims: refresca la sesión.
  const { data } = await supabase.auth.getClaims();
  const ruta = request.nextUrl.pathname;
  const privada = RUTAS_PRIVADAS.some((r) => ruta.startsWith(r)) && !RUTAS_ABIERTAS.some((r) => ruta.startsWith(r));
  if (!data?.claims && privada) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?volver=${encodeURIComponent(ruta)}`;
    return NextResponse.redirect(url);
  }
  return respuesta;
}
